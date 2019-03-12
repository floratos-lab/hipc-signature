package gov.nih.nci.ctd2.dashboard.dao;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import gov.nih.nci.ctd2.dashboard.model.AnimalModel;
import gov.nih.nci.ctd2.dashboard.model.Annotation;
import gov.nih.nci.ctd2.dashboard.model.CellSample;
import gov.nih.nci.ctd2.dashboard.model.CellSubset;
import gov.nih.nci.ctd2.dashboard.model.Compound;
import gov.nih.nci.ctd2.dashboard.model.DashboardEntity;
import gov.nih.nci.ctd2.dashboard.model.DashboardFactory;
import gov.nih.nci.ctd2.dashboard.model.Gene;
import gov.nih.nci.ctd2.dashboard.model.Observation;
import gov.nih.nci.ctd2.dashboard.model.ObservationTemplate;
import gov.nih.nci.ctd2.dashboard.model.ObservedEvidence;
import gov.nih.nci.ctd2.dashboard.model.ObservedEvidenceRole;
import gov.nih.nci.ctd2.dashboard.model.ObservedSubject;
import gov.nih.nci.ctd2.dashboard.model.ObservedSubjectRole;
import gov.nih.nci.ctd2.dashboard.model.Organism;
import gov.nih.nci.ctd2.dashboard.model.Pathogen;
import gov.nih.nci.ctd2.dashboard.model.Protein;
import gov.nih.nci.ctd2.dashboard.model.ShRna;
import gov.nih.nci.ctd2.dashboard.model.Subject;
import gov.nih.nci.ctd2.dashboard.model.SubjectWithOrganism;
import gov.nih.nci.ctd2.dashboard.model.Submission;
import gov.nih.nci.ctd2.dashboard.model.SubmissionCenter;
import gov.nih.nci.ctd2.dashboard.model.TissueSample;
import gov.nih.nci.ctd2.dashboard.model.Transcript;
import gov.nih.nci.ctd2.dashboard.model.Vaccine;
import gov.nih.nci.ctd2.dashboard.model.Xref;
import gov.nih.nci.ctd2.dashboard.util.DashboardEntityWithCounts;
import gov.nih.nci.ctd2.dashboard.util.SubjectWithSummaries;

public interface DashboardDao {
    void save(DashboardEntity entity);

    void update(DashboardEntity entity);

    void merge(DashboardEntity entity);

    void delete(DashboardEntity entity);

    <T extends DashboardEntity> T getEntityById(Class<T> entityClass, Integer id);

    <T extends DashboardEntity> T getEntityByStableURL(String type, String stableURL);

    Long countEntities(Class<? extends DashboardEntity> entityClass);

    Long countObservationsBySubjectId(Long subjectId);

    List<Observation> findObservationsBySubjectId(Long subjectId, int limit);

    DashboardFactory getDashboardFactory();

    void setDashboardFactory(DashboardFactory dashboardFactory);

    <T extends DashboardEntity> List<T> findEntities(Class<T> entityClass);

    List<Gene> findGenesByEntrezId(String entrezId);

    List<Gene> findGenesBySymbol(String symbol);

    List<Protein> findProteinsByUniprotId(String uniprotId);

    List<Transcript> findTranscriptsByRefseqId(String refseqId);

    List<CellSample> findCellSampleByAnnoType(String type);

    List<CellSample> findCellSampleByAnnoSource(String source);

    List<CellSample> findCellSampleByAnnoName(String name);

    List<CellSample> findCellSampleByAnnotation(Annotation annotation);

    List<TissueSample> findTissueSampleByName(String name);

    List<Vaccine> findVaccineByName(String name);

    List<CellSubset> findCellSubsetByName(String name);

    List<Pathogen> findPathogenByName(String name);

    List<CellSample> findCellLineByName(String name);

    List<ShRna> findSiRNAByReagentName(String reagent);

    List<ShRna> findSiRNAByTargetSequence(String targetSequence);

    List<Compound> findCompoundsByName(String compoundName);

    List<Compound> findCompoundsBySmilesNotation(String smilesNotation);

    List<AnimalModel> findAnimalModelByName(String animalModelName);

    List<Subject> findSubjectsByXref(String databaseName, String databaseId);

    List<Subject> findSubjectsByXref(Xref xref);

    List<Organism> findOrganismByTaxonomyId(String taxonomyId);

    List<SubjectWithOrganism> findSubjectByOrganism(Organism organism);

    List<Subject> findSubjectsBySynonym(String synonym, boolean exact);

    ObservedSubjectRole findObservedSubjectRole(String templateName, String columnName);

    ObservedEvidenceRole findObservedEvidenceRole(String templateName, String columnName);

    ObservationTemplate findObservationTemplateByName(String templateName);

    SubmissionCenter findSubmissionCenterByName(String submissionCenterName);

    List<Submission> findSubmissionBySubmissionCenter(SubmissionCenter submissionCenter);

    List<Observation> findObservationsBySubmission(Submission submission);

    List<ObservedSubject> findObservedSubjectBySubject(Subject subject);

    List<ObservedSubject> findObservedSubjectByObservation(Observation observation);

    List<ObservedEvidence> findObservedEvidenceByObservation(Observation observation);

    void batchSave(Collection<? extends DashboardEntity> entities, int batchSize);

    void createIndex(int batchSize);

    ArrayList<DashboardEntityWithCounts> search(String keyword);

    List<Submission> findSubmissionByIsStory(boolean isSubmissionStory, boolean sortByPriority);

    List<Submission> findSubmissionByObservationTemplate(ObservationTemplate observationTemplate);

    Submission findSubmissionByName(String submissionName);

    List<ObservationTemplate> findObservationTemplateBySubmissionCenter(SubmissionCenter submissionCenter);

    List<ObservedSubject> findObservedSubjectByRole(String role);

    List<SubjectWithSummaries> findSubjectWithSummariesByRole(String role, Integer minScore);

    List<Protein> findProteinByGene(Gene gene);

    public int countObservationsBySubjectIdAndText(Integer subjectId, String text);
}
