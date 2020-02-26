package gov.nih.nci.ctd2.dashboard.importer.internal;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import gov.nih.nci.ctd2.dashboard.dao.DashboardDao;
import gov.nih.nci.ctd2.dashboard.impl.ExpandedSummary;
import gov.nih.nci.ctd2.dashboard.model.DashboardEntity;
import gov.nih.nci.ctd2.dashboard.model.Evidence;
import gov.nih.nci.ctd2.dashboard.model.Observation;
import gov.nih.nci.ctd2.dashboard.model.ObservedEvidence;
import gov.nih.nci.ctd2.dashboard.model.ObservedSubject;
import gov.nih.nci.ctd2.dashboard.model.Submission;
import gov.nih.nci.ctd2.dashboard.util.StableURL;

@Component("observationDataWriter")
public class ObservationDataWriter implements ItemWriter<ObservationData> {

    private volatile int counter = 0;

    @Autowired
    private DashboardDao dashboardDao;

    private static final Log log = LogFactory.getLog(ObservationDataWriter.class);

    private Set<String> submissionCache = ConcurrentHashMap.newKeySet();

    @Autowired
    @Qualifier("batchSize")
    private Integer batchSize;

    private Map<String, Integer> observationIndex = new ConcurrentHashMap<String, Integer>();

    public void write(List<? extends ObservationData> items) throws Exception {
        // pre-conditions: (1) all the observation data in one call are from ONE
        // submission (although one submission may be allowed to be written in multiple
        // calls) (2) there is at least one observation in each call
        if (items.size() == 0) { // this might happen when some subject is rejected
            log.debug("no item");
            return;
        }
        final Submission submission = items.get(0).observation.getSubmission();
        final String submissionName = submission.getDisplayName();
        StableURL stableURL = new StableURL();
        synchronized (submission) {
            log.debug("[" + ++counter + "]SUBMISSION " + submissionName + ": " + items.size() + " observation(s)");
            final String submissionCacheKey = submissionName
                    + new SimpleDateFormat("yyyy.MM.dd").format(submission.getSubmissionDate())
                    + submission.getObservationTemplate().getDisplayName();
            if (!submissionCache.contains(submissionCacheKey)) {
                submission.setStableURL(stableURL.createURLWithPrefix("submission", submissionName));
                dashboardDao.save(submission);
                submissionCache.add(submissionCacheKey);
                observationIndex.put(submissionName, 0);
            }
        }

        List<Observation> observations = new ArrayList<Observation>();
        List<Evidence> evidences = new ArrayList<Evidence>();
        List<ObservedSubject> observedSubjects = new ArrayList<ObservedSubject>();
        List<ObservedEvidence> observedEvidences = new ArrayList<ObservedEvidence>();

        for (ObservationData observationData : items) {
            Observation observation = observationData.observation;
            int index = observationIndex.get(submissionName);
            observation.setStableURL(stableURL.createURLWithPrefix("observation", submissionName) + "-" + index);
            observations.add(observation);
            observationIndex.put(submissionName, index + 1);

            for (DashboardEntity e : observationData.evidence) {
                evidences.add((Evidence) e);
            }

            for (DashboardEntity e : observationData.observedEntities) {
                String className = e.getClass().getName();
                switch (className) {
                    case "gov.nih.nci.ctd2.dashboard.impl.ObservedSubjectImpl":
                        observedSubjects.add((ObservedSubject) e);
                        break;
                    case "gov.nih.nci.ctd2.dashboard.impl.ObservedEvidenceImpl":
                        observedEvidences.add((ObservedEvidence) e);
                        break;
                    default:
                        log.error("unexpected type " + className);
                }
            }
        }

        int batchSize = 100; // use a smaller batch size to prevent 'lock wait timeout'
        log.debug("observations to write " + observations.size());
        dashboardDao.batchSave(observations, batchSize);
        log.debug("observedSubjects to write " + observedSubjects.size());
        dashboardDao.batchSave(observedSubjects, batchSize);
        log.debug("evidences to write " + evidences.size());
        dashboardDao.batchSave(evidences, batchSize);
        log.debug("observedEvidences to write " + observedEvidences.size());
        dashboardDao.batchSave(observedEvidences, batchSize);
        log.debug("ALL WRITTEN: " + submissionName);

        // generate 'expanded summary'
        // this must be done after observations are saved so they already have IDs
        List<ExpandedSummary> expandedSummaries = new ArrayList<ExpandedSummary>();
        for (ObservationData observationData : items) {
            Observation observation = observationData.observation;
            String summary = observation.getSubmission().getObservationTemplate().getObservationSummary();
            for (DashboardEntity s : observationData.observedEntities) {
                String placeholder = null;
                String actualName = null;
                if (s instanceof ObservedSubject) {
                    ObservedSubject observedSubject = (ObservedSubject) s;
                    placeholder = observedSubject.getObservedSubjectRole().getColumnName();
                    actualName = observedSubject.getSubject().getDisplayName();
                } else if (s instanceof ObservedEvidence) {
                    ObservedEvidence observedEvidence = (ObservedEvidence) s;
                    placeholder = observedEvidence.getObservedEvidenceRole().getColumnName();
                    actualName = observedEvidence.getEvidence().getDisplayName();
                }

                if (actualName != null)
                    summary = summary.replace("<" + placeholder + ">", actualName);
            }
            ExpandedSummary es = new ExpandedSummary(observation.getId(), summary);
            expandedSummaries.add(es);
        }
        dashboardDao.batchSave(expandedSummaries, batchSize);
        log.debug("ObservationData written");
    }
}
