package gov.nih.nci.ctd2.dashboard.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import flexjson.JSONSerializer;
import gov.nih.nci.ctd2.dashboard.dao.DashboardDao;
import gov.nih.nci.ctd2.dashboard.model.DashboardEntity;
import gov.nih.nci.ctd2.dashboard.model.Observation;
import gov.nih.nci.ctd2.dashboard.model.Subject;
import gov.nih.nci.ctd2.dashboard.model.Submission;
import gov.nih.nci.ctd2.dashboard.util.DateTransformer;
import gov.nih.nci.ctd2.dashboard.util.ImplTransformer;

@Controller
@RequestMapping("/observations")
public class ObservationController {
    private static Log log = LogFactory.getLog(ObservationController.class);

    @Autowired
    private DashboardDao dashboardDao;

    @Autowired
    @Qualifier("maxNumberOfEntities")
    private Integer maxNumberOfEntities = 100;

    public Integer getMaxNumberOfEntities() {
        return maxNumberOfEntities;
    }

    public void setMaxNumberOfEntities(Integer maxNumberOfEntities) {
        this.maxNumberOfEntities = maxNumberOfEntities;
    }

    private List<Observation> getBySubmissionId(Integer submissionId) {
        Submission submission = dashboardDao.getEntityById(Submission.class, submissionId);
        if (submission != null) {
            return dashboardDao.findObservationsBySubmission(submission);
        } else {
            return new ArrayList<Observation>();
        }
    }

    /* only for CellSubset */
    private List<Observation> getBySubjectId(Integer subjectId, String role) {
        log.debug("subjectId=" + subjectId);
        Subject subject = dashboardDao.getEntityById(Subject.class, subjectId);
        if (subject != null) {
            return dashboardDao.findObservationsBySubjectId(Long.valueOf(subjectId), role, maxNumberOfEntities);
        } else {
            return new ArrayList<Observation>();
        }
    }

    @Transactional
    @RequestMapping(value = "countBySubmission", method = { RequestMethod.GET,
            RequestMethod.POST }, headers = "Accept=application/json")
    public ResponseEntity<String> countBySubmissionId(@RequestParam("submissionId") Integer submissionId) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        try {
            List<? extends DashboardEntity> entities = getBySubmissionId(submissionId);

            return new ResponseEntity<String>("" + entities.size(), headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<String>("Failed to get a count of observations for submission ID=" + submissionId,
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    @RequestMapping(value = "countBySubject", method = { RequestMethod.GET,
            RequestMethod.POST }, headers = "Accept=application/json")
    public ResponseEntity<String> countBySubjectId(@RequestParam("subjectId") Integer subjectId,
            @RequestParam(value = "role", required = false, defaultValue = "") String role) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        Long count = 0L;
        if (role.trim().length() > 0) { // only for CellSubset
            count = dashboardDao.countObservationsBySubjectId(Long.valueOf(subjectId), role);
        } else {
            count = dashboardDao.countObservationsBySubjectId(Long.valueOf(subjectId));
        }

        return new ResponseEntity<String>(count.toString(), headers, HttpStatus.OK);
    }

    @Transactional
    @RequestMapping(value = "bySubmission", method = { RequestMethod.GET,
            RequestMethod.POST }, headers = "Accept=application/json")
    public ResponseEntity<String> getObservationsBySubmissionId(@RequestParam("submissionId") Integer submissionId,

            @RequestParam(value = "getAll", required = false, defaultValue = "false") Boolean getAll) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        List<? extends DashboardEntity> entities = getBySubmissionId(submissionId);
        if (!getAll && entities.size() > getMaxNumberOfEntities()) {
            entities = entities.subList(0, getMaxNumberOfEntities());
        }

        JSONSerializer jsonSerializer = new JSONSerializer().transform(new ImplTransformer(), Class.class)
                .transform(new DateTransformer(), Date.class);

        return new ResponseEntity<String>(jsonSerializer.serialize(entities), headers, HttpStatus.OK);
    }

    @Transactional
    @RequestMapping(value = "bySubject", method = { RequestMethod.GET,
            RequestMethod.POST }, headers = "Accept=application/json")
    public ResponseEntity<String> getObservationsBySubjectId(@RequestParam("subjectId") Integer subjectId,
            @RequestParam(value = "role", required = false, defaultValue = "") String role) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        List<? extends DashboardEntity> entities = null;
        if (role.trim().length() > 0) { /* only for Cell Subset */
            entities = getBySubjectId(subjectId, role);
        } else { // fast query if we can ignore other criteria
            entities = dashboardDao.findObservationsBySubjectId(Long.valueOf(subjectId), maxNumberOfEntities);
        }

        JSONSerializer jsonSerializer = new JSONSerializer().transform(new ImplTransformer(), Class.class)
                .transform(new DateTransformer(), Date.class);

        return new ResponseEntity<String>(jsonSerializer.serialize(entities), headers, HttpStatus.OK);
    }

    @Transactional
    @RequestMapping(value = "countFiltered", method = { RequestMethod.POST,
            RequestMethod.GET }, headers = "Accept=application/json")
    public ResponseEntity<String> countFiltered(@RequestParam("subjectId") Integer subjectId,
            @RequestParam("filterBy") String filterBy) {

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");
        JSONSerializer jsonSerializer = new JSONSerializer();

        Integer result = dashboardDao.countObservationsFiltered(subjectId, filterBy);
        return new ResponseEntity<String>(jsonSerializer.deepSerialize(result), headers, HttpStatus.OK);
    }

    @Transactional
    @RequestMapping(value = "filtered", method = { RequestMethod.POST,
            RequestMethod.GET }, headers = "Accept=application/json")
    public ResponseEntity<String> filtered(@RequestParam("subjectId") Integer subjectId,
            @RequestParam("filterBy") String filterBy) {

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        try {
            List<Observation> result = dashboardDao.getObservationsFiltered(subjectId, filterBy);
            JSONSerializer jsonSerializer = new JSONSerializer().transform(new ImplTransformer(), Class.class)
                    .transform(new DateTransformer(), Date.class);
            return new ResponseEntity<String>(jsonSerializer.deepSerialize(result), headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<String>("error in observations/filtered", headers,
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
