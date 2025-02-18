package gov.nih.nci.ctd2.dashboard.dao.internal;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.lucene.analysis.core.WhitespaceAnalyzer;
import org.apache.lucene.queryparser.classic.MultiFieldQueryParser;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.search.Query;
import org.hibernate.FlushMode;
import org.hibernate.ScrollMode;
import org.hibernate.ScrollableResults;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.search.FullTextQuery;
import org.hibernate.search.FullTextSession;
import org.hibernate.search.Search;
import org.springframework.cache.annotation.Cacheable;

import gov.nih.nci.ctd2.dashboard.dao.DashboardDao;
import gov.nih.nci.ctd2.dashboard.impl.DashboardEntityImpl;
import gov.nih.nci.ctd2.dashboard.impl.ObservationTemplateImpl;
import gov.nih.nci.ctd2.dashboard.impl.SubjectImpl;
import gov.nih.nci.ctd2.dashboard.impl.TissueSampleImpl;
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
import gov.nih.nci.ctd2.dashboard.model.Synonym;
import gov.nih.nci.ctd2.dashboard.model.TissueSample;
import gov.nih.nci.ctd2.dashboard.model.Transcript;
import gov.nih.nci.ctd2.dashboard.model.Vaccine;
import gov.nih.nci.ctd2.dashboard.model.Xref;
import gov.nih.nci.ctd2.dashboard.util.GeneData;
import gov.nih.nci.ctd2.dashboard.util.PMIDResult;
import gov.nih.nci.ctd2.dashboard.util.SubjectWithSummaries;
import gov.nih.nci.ctd2.dashboard.util.WordCloudEntry;
import gov.nih.nci.ctd2.dashboard.util.SearchResults;
import gov.nih.nci.ctd2.dashboard.util.SearchResults.StudyResult;
import gov.nih.nci.ctd2.dashboard.util.SubjectResult;

public class DashboardDaoImpl implements DashboardDao {
    private static Log log = LogFactory.getLog(DashboardDaoImpl.class);

    private static final String[] defaultSearchFields = { DashboardEntityImpl.FIELD_DISPLAYNAME,
            DashboardEntityImpl.FIELD_DISPLAYNAME_WS, DashboardEntityImpl.FIELD_DISPLAYNAME_UT,
            SubjectImpl.FIELD_SYNONYM, SubjectImpl.FIELD_SYNONYM_WS, SubjectImpl.FIELD_SYNONYM_UT,
            ObservationTemplateImpl.FIELD_DESCRIPTION, TissueSampleImpl.FIELD_LINEAGE };

    private static final Class<?>[] searchableClasses = { SubjectImpl.class, ObservationTemplateImpl.class };

    private SessionFactory sessionFactory;

    public SessionFactory getSessionFactory() {
        return sessionFactory;
    }

    public void setSessionFactory(SessionFactory sessionFactory) {
        this.sessionFactory = sessionFactory;
    }

    private Session getSession() {
        Session session = getSessionFactory().openSession();
        return session;
    }

    private DashboardFactory dashboardFactory;

    public DashboardFactory getDashboardFactory() {
        return dashboardFactory;
    }

    public void setDashboardFactory(DashboardFactory dashboardFactory) {
        this.dashboardFactory = dashboardFactory;
    }

    private Integer maxNumberOfSearchResults = 100;

    public Integer getMaxNumberOfSearchResults() {
        return maxNumberOfSearchResults;
    }

    public void setMaxNumberOfSearchResults(Integer maxNumberOfSearchResults) {
        this.maxNumberOfSearchResults = maxNumberOfSearchResults;
    }

    @Override
    public void save(DashboardEntity entity) {
        Session session = getSession();
        session.beginTransaction();
        session.save(entity);
        session.flush();
        session.getTransaction().commit();
        session.close();
    }

    @Override
    public void batchSave(Collection<? extends DashboardEntity> entities, int batchSize) {
        if (entities == null || entities.isEmpty())
            return;

        Session session = getSessionFactory().openSession();
        session.beginTransaction();
        int i = 0;
        for (DashboardEntity entity : entities) {
            if (entity instanceof Subject) {
                Subject subject = (Subject) entity;
                for (Xref x : subject.getXrefs()) {
                    session.save(x);
                }
                for (Synonym x : subject.getSynonyms()) {
                    session.save(x);
                }
            }
            session.save(entity);
            i++;
            if (batchSize != 0 && i % batchSize == 0) {
                session.flush();
                session.clear();
            }
        }
        session.flush();
        session.clear();
        session.getTransaction().commit();
        session.close();
    }

    @Override
    public void batchMerge(Collection<? extends Subject> subjects) {
        if (subjects == null || subjects.isEmpty())
            return;

        Session session = getSessionFactory().openSession();
        session.beginTransaction();
        for (Subject subject : subjects) {
            session.merge(subject);
        }
        session.getTransaction().commit();
        session.close();
    }

    @Override
    public void update(DashboardEntity entity) {
        Session session = getSession();
        session.update(entity);
        session.close();
    }

    @Override
    public void merge(DashboardEntity entity) {
        Session session = getSession();
        session.beginTransaction();
        session.merge(entity);
        session.getTransaction().commit();
        session.close();
    }

    @Override
    public void delete(DashboardEntity entity) {
        Session session = getSession();
        session.beginTransaction();
        session.delete(entity);
        session.flush();
        session.getTransaction().commit();
        session.close();
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T extends DashboardEntity> T getEntityById(Class<T> entityClass, Integer id) {
        Class<T> aClass = entityClass.isInterface() ? dashboardFactory.getImplClass(entityClass) : entityClass;
        Session session = getSession();
        Object object = session.get(aClass, id);
        session.close();
        return (T) object;
    }

    final private static Map<String, String> typesWithStableURL = new HashMap<String, String>();
    static {
        typesWithStableURL.put("center", "SubmissionCenterImpl");
        typesWithStableURL.put("animal-model", "AnimalModelImpl");
        typesWithStableURL.put("cell-sample", "CellSampleImpl");
        typesWithStableURL.put("compound", "CompoundImpl");
        typesWithStableURL.put("protein", "ProteinImpl");
        typesWithStableURL.put("rna", "ShRnaImpl");
        typesWithStableURL.put("tissue", "TissueSampleImpl");
        typesWithStableURL.put("transcript", "TranscriptImpl");
        typesWithStableURL.put("submission", "SubmissionImpl");
        typesWithStableURL.put("observation", "ObservationImpl");
        typesWithStableURL.put("observedevidence", "ObservedEvidenceImpl");
        typesWithStableURL.put("cell-subset", "CellSubsetImpl");
        typesWithStableURL.put("pathogen", "PathogenImpl");
        typesWithStableURL.put("vaccine", "VaccineImpl");
    }

    @Override
    public <T extends DashboardEntity> T getEntityByStableURL(String type, String stableURL) {
        String implementationClass = typesWithStableURL.get(type);
        log.debug("getEntityByStableURL " + type + " " + stableURL + " " + implementationClass);
        if (implementationClass != null) {
            List<T> r = queryWithClass("from " + implementationClass + " where stableURL = :urlId", "urlId", stableURL);
            if (r.size() == 1) {
                return r.get(0);
            } else if (implementationClass.equals("ObservedEvidenceImpl") && r.size() > 0) {
                /*
                 * This is to take care of a special case in the current data model
                 * implementation: multiple instances of the SAME evidence are created for
                 * multiple observations that refer to that evidence.
                 */
                return r.get(0);
            } else {
                log.debug("unexpected result number: " + r.size() + " " + type + " " + stableURL);
                return null;
            }
        } else {
            log.error("unrecognized type: " + type);
            return null;
        }
    }

    @Override
    public Long countEntities(Class<? extends DashboardEntity> entityClass) {
        Session session = getSession();
        CriteriaBuilder cb = session.getCriteriaBuilder();
        CriteriaQuery<Long> cq = cb.createQuery(Long.class);
        cq.select(cb.count(cq.from(dashboardFactory.getImplClass(entityClass))));
        TypedQuery<Long> typedQuery = session.createQuery(cq);
        Long count = typedQuery.getSingleResult();
        session.close();
        return count;
    }

    @Override
    public <T extends DashboardEntity> List<T> findEntities(Class<T> entityClass) {
        Class<T> implClass = dashboardFactory.getImplClass(entityClass);
        Session session = getSession();
        CriteriaBuilder cb = session.getCriteriaBuilder();
        CriteriaQuery<T> cq = cb.createQuery(implClass);
        cq.from(implClass); // ignore the return value Root<T>
        TypedQuery<T> typedQuery = session.createQuery(cq);
        List<T> list = typedQuery.getResultList();
        session.close();
        return list;
    }

    @Override
    public List<ObservationTemplate> findObservationTemplateBySubmissionCenter(SubmissionCenter submissionCenter) {
        return queryWithClass("from ObservationTemplateImpl where submissionCenter = :center", "center",
                submissionCenter);
    }

    @Override
    public List<Gene> findGenesByEntrezId(String entrezId) {
        return queryWithClass("from GeneImpl where entrezGeneId = :entrezId", "entrezId", entrezId);
    }

    @Override
    public List<Gene> findGenesBySymbol(String symbol) {
        return queryWithClass("from GeneImpl where displayName = :symbol", "symbol", symbol);
    }

    @Override
    public List<Gene> findHumanGenesBySymbol(String symbol) {
        return queryWithClass("from GeneImpl where displayName = :symbol AND organism.displayName='Homo sapiens'", "symbol", symbol);
    }

    @Override
    public List<Protein> findProteinsByUniprotId(String uniprotId) {
        return queryWithClass("from ProteinImpl where uniprotId = :uniprotId", "uniprotId", uniprotId);
    }

    @Override
    public List<Transcript> findTranscriptsByRefseqId(String refseqId) {
        String[] parts = refseqId.split("\\.");
        return queryWithClass("from TranscriptImpl where refseqId like :refseqId", "refseqId", parts[0] + "%");
    }

    private List<CellSample> findCellSampleByAnnotationField(String field, String value) {
        List<CellSample> cellSamples = new ArrayList<CellSample>();
        List<Annotation> annoList = queryWithClass("from AnnotationImpl where " + field + " = :value", "value", value);
        for (Annotation anno : annoList) {
            List<CellSample> list = queryWithClass("from CellSampleImpl as cs where :anno member of cs.annotations",
                    "anno", anno);
            for (CellSample cellSample : list) {
                if (!cellSamples.contains(cellSample)) {
                    cellSamples.add(cellSample);
                }
            }
        }

        return cellSamples;
    }

    @Override
    public List<CellSample> findCellSampleByAnnoType(String type) {
        return findCellSampleByAnnotationField("type", type);
    }

    @Override
    public List<CellSample> findCellSampleByAnnoSource(String source) {
        return findCellSampleByAnnotationField("source", source);
    }

    @Override
    public List<CellSample> findCellSampleByAnnoName(String name) {
        return findCellSampleByAnnotationField("displayName", name);
    }

    @Override
    public List<CellSample> findCellSampleByAnnotation(Annotation annotation) {
        return queryWithClass("select cs from CellSampleImpl as cs where :anno member of cs.annotations", "anno",
                annotation);
    }

    @Override
    public List<TissueSample> findTissueSampleByName(String name) {
        return queryWithClass("from TissueSampleImpl where displayName = :name", "name", name);
    }

    @Override
    public List<CellSample> findCellLineByName(String name) {
        List<CellSample> cellSamples = new ArrayList<CellSample>();
        for (Subject subject : findSubjectsBySynonym(name, true)) {
            if (subject instanceof CellSample) {
                cellSamples.add((CellSample) subject);
            }
        }
        return cellSamples;
    }

    @Override
    public List<ShRna> findSiRNAByReagentName(String reagent) {
        return queryWithClass("from ShRnaImpl where reagentName = :reagentName", "reagentName", reagent);
    }

    @Override
    public List<ShRna> findSiRNAByTargetSequence(String targetSequence) {
        return queryWithClass("from ShRnaImpl where targetSequence = :targetSequence", "targetSequence",
                targetSequence);
    }

    @Override
    public List<Compound> findCompoundsByName(String compoundName) {
        return queryWithClass("from CompoundImpl where displayName = :displayName", "displayName", compoundName);
    }

    @Override
    public List<Compound> findCompoundsBySmilesNotation(String smilesNotation) {
        return queryWithClass("from CompoundImpl where smilesNotation = :smilesNotation", "smilesNotation",
                smilesNotation);
    }

    @Override
    public List<AnimalModel> findAnimalModelByName(String animalModelName) {
        return queryWithClass("from AnimalModelImpl where displayName = :aname", "aname", animalModelName);
    }

    @Override
    public List<Subject> findSubjectsByXref(String databaseName, String databaseId) {
        Set<Subject> subjects = new HashSet<Subject>();
        List<Xref> list = query2ParamsWithClass("from XrefImpl where databaseName = :dname and databaseId = :did",
                "dname", databaseName, "did", databaseId);
        for (Xref o : list) {
            subjects.addAll(findSubjectsByXref(o));
        }

        return new ArrayList<Subject>(subjects);
    }

    @Override
    public List<Subject> findSubjectsByXref(Xref xref) {
        return queryWithClass("select o from SubjectImpl o where :xref member of o.xrefs", "xref", xref);
    }

    @Override
    public List<Organism> findOrganismByTaxonomyId(String taxonomyId) {
        return queryWithClass("from OrganismImpl where taxonomyId = :tid", "tid", taxonomyId);
    }

    @Override
    public List<SubjectWithOrganism> findSubjectByOrganism(Organism organism) {
        return queryWithClass("from SubjectWithOrganismImpl where organism = :organism", "organism", organism);
    }

    @Override
    public List<Subject> findSubjectsBySynonym(String synonym, boolean exact) {
        Set<Subject> subjects = new HashSet<Subject>();

        // First grab the synonyms
        String query = "from SynonymImpl where displayName "
                + (exact ? " = :synonym" : "like concat('%', :synonym, '%')");
        List<Synonym> synonymList = queryWithClass(query, "synonym", synonym);
        for (Synonym o : synonymList) {
            // Second: find subjects with the synonym
            List<Subject> subjectList = queryWithClass(
                    "select o from SubjectImpl as o where :synonyms member of o.synonyms", "synonyms", o);
            for (Subject o2 : subjectList) {
                subjects.add(o2);
            }
        }

        return new ArrayList<Subject>(subjects);
    }

    @Override
    public ObservedSubjectRole findObservedSubjectRole(String templateName, String columnName) {
        List<ObservedSubjectRole> list = new ArrayList<ObservedSubjectRole>();
        // first grab observation template name
        List<ObservationTemplate> otList = queryWithClass(
                "from ObservationTemplateImpl where displayName = :templateName", "templateName", templateName);
        for (ObservationTemplate ot : otList) {
            List<ObservedSubjectRole> osrList = query2ParamsWithClass(
                    "from ObservedSubjectRoleImpl as osr where columnName = :columnName and "
                            + "osr.observationTemplate = :ot",
                    "columnName", columnName, "ot", ot);
            for (ObservedSubjectRole o : osrList) {
                list.add(o);
            }
        }
        assert list.size() <= 1;
        return (list.size() == 1) ? list.iterator().next() : null;
    }

    @Override
    public ObservedEvidenceRole findObservedEvidenceRole(String templateName, String columnName) {
        List<ObservedEvidenceRole> list = new ArrayList<ObservedEvidenceRole>();
        // first grab observation template name
        List<ObservationTemplate> otList = queryWithClass(
                "from ObservationTemplateImpl where displayName = :templateName", "templateName", templateName);
        for (ObservationTemplate ot : otList) {
            List<ObservedEvidenceRole> oerList = query2ParamsWithClass(
                    "from ObservedEvidenceRoleImpl as oer where columnName = :columnName and "
                            + "oer.observationTemplate = :ot",
                    "columnName", columnName, "ot", ot);
            for (ObservedEvidenceRole o : oerList) {
                list.add(o);
            }
        }
        assert list.size() <= 1;
        return (list.size() == 1) ? list.iterator().next() : null;
    }

    @Override
    public ObservationTemplate findObservationTemplateByName(String templateName) {
        List<ObservationTemplate> list = queryWithClass("from ObservationTemplateImpl where displayName = :tname",
                "tname", templateName);
        assert list.size() <= 1;
        if(list.size() > 1) {
            log.error("duplicate template name " + templateName);
        }
        return (list.size() == 1) ? list.iterator().next() : null;
    }

    @Override
    public SubmissionCenter findSubmissionCenterByName(String submissionCenterName) {
        List<SubmissionCenter> list = queryWithClass("from SubmissionCenterImpl where displayName = :cname", "cname",
                submissionCenterName);
        assert list.size() <= 1;
        return (list.size() == 1) ? list.iterator().next() : null;
    }

    @Override
    public List<Submission> findSubmissionByIsStory(boolean isSubmissionStory, boolean sortByPriority) {
        List<ObservationTemplate> tmpList1 = queryWithClass(
                "from ObservationTemplateImpl where isSubmissionStory = :iss order by submissionStoryRank desc", "iss",
                isSubmissionStory);
        List<ObservationTemplate> tmpList2 = queryWithClass(
                "from ObservationTemplateImpl where isSubmissionStory = :iss", "iss", isSubmissionStory);
        List<ObservationTemplate> tmpList = sortByPriority ? tmpList1 : tmpList2;

        List<Submission> list = new ArrayList<Submission>();
        for (ObservationTemplate o : tmpList) {
            list.addAll(findSubmissionByObservationTemplate(o));
        }

        return list;
    }

    @Override
    public List<Submission> findSubmissionByObservationTemplate(ObservationTemplate observationTemplate) {
        return queryWithClass("from SubmissionImpl where observationTemplate = :ot", "ot", observationTemplate);
    }

    @Override
    public Submission findSubmissionByName(String submissionName) {
        List<Submission> submissions = queryWithClass("from SubmissionImpl where displayName = :sname", "sname",
                submissionName);
        assert submissions.size() <= 1;
        return (submissions.size() == 1) ? submissions.iterator().next() : null;
    }

    @Override
    public List<Submission> findSubmissionBySubmissionCenter(SubmissionCenter submissionCenter) {
        List<Submission> list = new ArrayList<Submission>();
        for (ObservationTemplate o : findObservationTemplateBySubmissionCenter(submissionCenter)) {
            list.addAll(findSubmissionByObservationTemplate(o));
        }

        return list;
    }

    @Override
    public List<Observation> findObservationsBySubmission(Submission submission) {
        return queryWithClass("from ObservationImpl where submission = :submission", "submission", submission);
    }

    @Override
    public Long countObservationsBySubjectId(Long subjectId) {
        Session session = getSession();
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<BigInteger> query = session.createNativeQuery(
                "SELECT COUNT(observation_id) FROM observed_subject S WHERE subject_id=" + subjectId);
        BigInteger count = query.uniqueResult();
        session.close();
        return count.longValue();
    }

    @Override
    public Long countObservationsBySubjectId(Long subjectId, String role) {
        Session session = getSession();
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<BigInteger> query = session
                .createNativeQuery("SELECT COUNT(*) FROM observed_subject JOIN subject ON subject_id=subject.id"
                        + " JOIN observed_subject_role ON observedSubjectRole_id=observed_subject_role.id"
                        + " JOIN subject_role ON subjectRole_id=subject_role.id"
                        + " JOIN dashboard_entity ON subject_role.id=dashboard_entity.id" + " WHERE subject_id="
                        + subjectId + " AND displayName='" + role + "'");
        BigInteger count = query.uniqueResult();
        session.close();
        return count.longValue();
    }

    @Override
    public List<Observation> findObservationsBySubjectId(Long subjectId, int limit) {
        Session session = getSession();
        session.setDefaultReadOnly(true);
        org.hibernate.query.Query<?> query = session.createNativeQuery(
                "SELECT observation_id FROM observed_subject S WHERE subject_id=" + subjectId + " LIMIT " + limit);
        List<?> ids = query.list();
        List<Observation> list = new ArrayList<Observation>();
        for (Object id : ids) {
            TypedQuery<Observation> obsvnQuery = session.createQuery("FROM ObservationImpl WHERE id=" + id,
                    Observation.class);
            Observation observation = obsvnQuery.getSingleResult();
            list.add(observation);
        }
        session.close();
        return list;
    }

    @Override
    public List<Observation> findObservationsBySubjectId(Long subjectId, String role, int limit) {
        Session session = getSession();
        session.setDefaultReadOnly(true);
        org.hibernate.query.Query<?> query = session
                .createNativeQuery("SELECT observation_id FROM observed_subject JOIN subject ON subject_id=subject.id"
                        + " JOIN observed_subject_role ON observedSubjectRole_id=observed_subject_role.id"
                        + " JOIN subject_role ON subjectRole_id=subject_role.id"
                        + " JOIN dashboard_entity ON subject_role.id=dashboard_entity.id" + " WHERE subject_id="
                        + subjectId + " AND displayName='" + role + "' LIMIT " + limit);
        List<?> ids = query.list();
        List<Observation> list = new ArrayList<Observation>();
        for (Object id : ids) {
            TypedQuery<Observation> obsvnQuery = session.createQuery("FROM ObservationImpl WHERE id=" + id,
                    Observation.class);
            Observation observation = obsvnQuery.getSingleResult();
            list.add(observation);
        }
        session.close();
        return list;
    }

    @Override
    public List<ObservedSubject> findObservedSubjectBySubject(Subject subject) {
        return queryWithClass("from ObservedSubjectImpl where subject = :subject ", "subject", subject);
    }

    @Override
    public List<ObservedSubject> findObservedSubjectByObservation(Observation observation) {
        return queryWithClass("from ObservedSubjectImpl where observation = :observation", "observation", observation);
    }

    @Override
    public List<ObservedEvidence> findObservedEvidenceByObservation(Observation observation) {
        return queryWithClass("from ObservedEvidenceImpl where observation = :observation", "observation", observation);
    }

    /* purge the index if there is no observation having this subject */
    @SuppressWarnings("unchecked")
    @Override
    public void cleanIndex(int batchSize) {
        Session session = getSession();
        org.hibernate.query.Query<BigInteger> query = session.createNativeQuery(
                "SELECT id FROM subject WHERE id NOT IN (SELECT DISTINCT subject_id FROM observed_subject)");
        ScrollableResults scrollableResults = query.scroll(ScrollMode.FORWARD_ONLY);

        FullTextSession fullTextSession = Search.getFullTextSession(getSession());
        fullTextSession.setHibernateFlushMode(FlushMode.MANUAL);

        int cnt = 0;
        while (scrollableResults.next()) {
            Integer id = (Integer) scrollableResults.get(0);
            fullTextSession.purge(DashboardEntityImpl.class, id);

            if (++cnt % batchSize == 0) {
                fullTextSession.flushToIndexes();
            }
        }

        fullTextSession.flushToIndexes();
        fullTextSession.clear();

        session.close();
    }

    /* delimited by whitespaces only, except when it is quoted. */
    private static String[] parseWords(String str) {
        List<String> list = new ArrayList<String>();
        Matcher m = Pattern.compile("([^\"]\\S*|\".+?\")\\s*").matcher(str);
        while (m.find())
            list.add(m.group(1));
        return list.toArray(new String[0]);
    }

    /*
     * a subject is a match when either the name contains the term or the synonyms
     * contain the term
     */
    private static boolean matchSubject(String term, Subject subject) {
        if (subject.getDisplayName().toLowerCase().contains(term))
            return true;
        for (Synonym s : subject.getSynonyms()) {
            if (s.getDisplayName().toLowerCase().contains(term))
                return true;
        }
        if(subject instanceof Pathogen) {
            Pathogen p = (Pathogen)subject;
            for (Synonym s : p.getExactSynonyms()) {
                if (s.getDisplayName().toLowerCase().contains(term))
                    return true;
            }
        }
        return false;
    }

    private void directTextSearch(final String singleTerm, final Map<Subject, Integer> subjects,
            final List<StudyResult> studies) {
        Session session = getSession();
        String sql = "SELECT DISTINCT subject_id FROM observed_subject JOIN dashboard_entity ON observed_subject.subject_id=dashboard_entity.id WHERE displayName LIKE :name";
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<Integer> query = session.createNativeQuery(sql);
        query.setParameter("name", "%" + singleTerm + "%");
        List<Integer> list = new ArrayList<Integer>();
        try {
            list = query.list();
            log.debug(
                    "number of subjects matching '" + singleTerm + "' in displayName: " + list.size());
        } catch (javax.persistence.NoResultException e) { // exception by design
            // no-op
            log.debug("No subject found for " + singleTerm);
        }
        Set<Integer> matchedSubjects = new HashSet<Integer>();
        matchedSubjects.addAll(list);
        query = null;
        list = null; // just to prevent accidental usage after this

        String synonymBasedQuery = "SELECT DISTINCT SubjectImpl_id FROM subject_synonym_map "
                + "JOIN dashboard_entity ON subject_synonym_map.synonyms_id=dashboard_entity.id "
                + "WHERE displayName LIKE :name";
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<Integer> query2 = session.createNativeQuery(synonymBasedQuery);
        query2.setParameter("name", "%" + singleTerm + "%");
        List<Integer> list2 = new ArrayList<Integer>();
        try {
            list2 = query2.list();
            log.debug(
                    "number of subjects with synonyms matching '" + singleTerm + "' in displayName: " + list2.size());
        } catch (javax.persistence.NoResultException e) { // exception by design
            // no-op
            log.debug("No subject found with synonyms matching " + singleTerm);
        }
        session.close();
        for (Integer id : list2) {
            if (notObserved(id)) {
                continue;
            }
            matchedSubjects.add(id);
        }
        list2 = null;

        for (Integer id : matchedSubjects) {
            Subject s = getEntityById(Subject.class, id);
            if (subjects.containsKey(s)) {
                subjects.put(s, subjects.get(s) + 1);
            } else {
                subjects.put(s, 1);
            }
        }

        List<ObservationTemplate> observationTemplateList = queryWithClass(
                "SELECT obj FROM ObservationTemplateImpl AS obj WHERE obj.description LIKE :description",
                "description",
                "%" + singleTerm + "%");
        Map<Integer, Integer> number_of_signatures = new HashMap<Integer, Integer>();
        Map<Integer,Date> pmid_date = new HashMap<Integer, Date>();
        Map<Integer,String> pmid_description = new HashMap<Integer, String>();

        for (ObservationTemplate template : observationTemplateList) {
            Integer pmid = template.getPMID();
            if (number_of_signatures.containsKey(pmid)) {
                number_of_signatures.put(pmid, number_of_signatures.get(pmid) + 1);
            } else {
                number_of_signatures.put(pmid, 1);
                Date publicationDate = getPublicationDate(template.getId());
                pmid_date.put(pmid, publicationDate);
                pmid_description.put(pmid, template.getDescription());
            }
        }
        for (Integer pmid : number_of_signatures.keySet()) {
            StudyResult from_other_search_term = getStudyResult(studies, pmid);
            if(from_other_search_term==null) {
                studies.add(new StudyResult(
                    pmid_date.get(pmid),
                    pmid_description.get(pmid),
                    pmid,
                    number_of_signatures.get(pmid))
                );
            } else {
                from_other_search_term.matchNumber++;
            }
        }
    }

    static private StudyResult getStudyResult(final List<StudyResult> studies, Integer pmid) {
        for(StudyResult x: studies) {
            if(x.pmid.equals(pmid)) return x;
        }
        return null;
    }

    private void searchSingleTerm(final String singleTerm, final Map<Subject, Integer> subjects,
            final List<StudyResult> studies) {
        FullTextSession fullTextSession = Search.getFullTextSession(getSession());
        MultiFieldQueryParser multiFieldQueryParser = new MultiFieldQueryParser(defaultSearchFields,
                new WhitespaceAnalyzer());
        multiFieldQueryParser.setAllowLeadingWildcard(true);
        Query luceneQuery = null;
        try {
            luceneQuery = multiFieldQueryParser.parse(singleTerm);
            log.debug(luceneQuery);
        } catch (ParseException e) {
            e.printStackTrace();
            return;
        }

        FullTextQuery fullTextQuery = fullTextSession.createFullTextQuery(luceneQuery, searchableClasses);
        fullTextQuery.setReadOnly(true);
        List<?> list = fullTextQuery.list();
        fullTextSession.close();

        Integer numberOfSearchResults = getMaxNumberOfSearchResults();
        if (numberOfSearchResults > 0 && list.size() > numberOfSearchResults) {
            // if lte 0, the maximum number is ignored
            log.warn("search result number " + list.size() + " is larger than the maximum expected, "
                    + numberOfSearchResults);
        }

        Map<Integer, Integer> number_of_signatures = new HashMap<Integer, Integer>();
        Map<Integer,Date> pmid_date = new HashMap<Integer, Date>();
        Map<Integer,String> pmid_description = new HashMap<Integer, String>();

        for (Object o : list) {
            if (o instanceof ObservationTemplate) {
                ObservationTemplate template = (ObservationTemplate)o;
                Integer pmid = template.getPMID();
                if (number_of_signatures.containsKey(pmid)) {
                    number_of_signatures.put(pmid, number_of_signatures.get(pmid) + 1);
                } else {
                    number_of_signatures.put(pmid, 1);
                    Date publicationDate = getPublicationDate(template.getId());
                    pmid_date.put(pmid, publicationDate);
                    pmid_description.put(pmid, template.getDescription());
                }
            } else if (o instanceof Subject) {
                Subject s = (Subject) o;
                // if s is a tissue sample, check whether it is observed. if not, skip.
                if (s instanceof TissueSample && notObserved(s.getId())) {
                    continue;
                }
                if (subjects.containsKey(s)) {
                    subjects.put(s, subjects.get(s) + 1);
                } else {
                    subjects.put(s, 1);
                }
            } else {
                log.warn("unexpected type returned by searching: " + o.getClass().getName());
            }
        }
        for (Integer pmid : number_of_signatures.keySet()) {
            StudyResult from_other_search_term = getStudyResult(studies, pmid);
            if(from_other_search_term==null) {
                studies.add(new StudyResult(
                    pmid_date.get(pmid),
                    pmid_description.get(pmid),
                    pmid,
                    number_of_signatures.get(pmid)));
            } else {
                from_other_search_term.matchNumber++;
            }
        }
    }

    // this is needed due to the limitation of the original data model of submission and observation template
    // the date is unique for an observation template but redundant across multiple 'submission'
    private Date getPublicationDate(int observation_template_id) {
        String sql = "SELECT submissionDate FROM submission WHERE observationTemplate_id=:id";
        Session session = getSession();
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<Date> query = session.createNativeQuery(sql);
        query.setParameter("id", observation_template_id);
        Date x = query.getSingleResult();
        session.close();
        return x;
    }

    @Override
    @Cacheable(value = "searchCache")
    public SearchResults search(String queryString) {
        queryString = queryString.trim();
        final String[] searchTerms = parseWords(queryString);
        log.debug("search terms: " + String.join(",", searchTerms));
        Map<Subject, Integer> subjects = new HashMap<Subject, Integer>();
        List<StudyResult> study_results = new ArrayList<StudyResult>();
        final Pattern quoted = Pattern.compile("\"([^\"]+)\"");
        for (String singleTerm : searchTerms) {
            Matcher matcher = quoted.matcher(singleTerm);
            // two search strategies: original index-based search, and direct text search.
            if (matcher.matches()) {
                directTextSearch(matcher.group(1), subjects, study_results);
            } else {
                searchSingleTerm(singleTerm, subjects, study_results);
            }
        }
        SearchResults searchResults = new SearchResults();
        searchResults.study_result = study_results;

        Map<String, Set<Observation>> observationMap = new HashMap<String, Set<Observation>>();

        List<SubjectResult> subject_result = new ArrayList<SubjectResult>();
        for (Subject subject : subjects.keySet()) {
            Set<Observation> observations = new HashSet<Observation>();
            Set<SubmissionCenter> submissionCenters = new HashSet<SubmissionCenter>();
            Set<String> roles = new HashSet<String>();
            for (ObservedSubject observedSubject : findObservedSubjectBySubject(subject)) {
                Observation observation = observedSubject.getObservation();
                observations.add(observation);
                ObservationTemplate observationTemplate = observation.getSubmission().getObservationTemplate();
                submissionCenters.add(observationTemplate.getSubmissionCenter());
                roles.add(observedSubject.getObservedSubjectRole().getSubjectRole().getDisplayName());
            }
            SubjectResult x = new SubjectResult(subject, observations.size(), submissionCenters.size(),
                    subjects.get(subject), roles);
            Arrays.stream(searchTerms).filter(term -> matchSubject(term, subject)).forEach(term -> {
                Set<Observation> obset = observationMap.get(term);
                if (obset == null) {
                    obset = new HashSet<Observation>();
                }
                obset.addAll(observations);
                observationMap.put(term, obset);
            });
            subject_result.add(x);
        }

        // search by VO code
        List<Vaccine> vaccineList = searchVaccineByCode(queryString);
        for (Vaccine v : vaccineList) {
            int observationNumber = countObservation(v.getId());
            if (observationNumber == 0)
                continue;
            Set<String> roles = new HashSet<String>();
            Set<SubmissionCenter> submissionCenters = new HashSet<SubmissionCenter>();
            Set<Observation> observations = new HashSet<Observation>();
            for (ObservedSubject observedSubject : findObservedSubjectBySubject(v)) {
                Observation observation = observedSubject.getObservation();
                observations.add(observation);
                ObservationTemplate observationTemplate = observation.getSubmission().getObservationTemplate();
                submissionCenters.add(observationTemplate.getSubmissionCenter());
                roles.add(observedSubject.getObservedSubjectRole().getSubjectRole().getDisplayName());
            }
            SubjectResult x = new SubjectResult(v, observationNumber,
                submissionCenters.size(),
                1, roles);
            subject_result.add(x);

            Arrays.stream(searchTerms).filter(term -> v.getDisplayName().contains(term)).forEach(term -> {
                Set<Observation> obset = observationMap.get(term);
                if (obset == null) {
                    obset = new HashSet<Observation>();
                }
                obset.addAll(observations);
                observationMap.put(term, obset);
            });
        }
        searchResults.subject_result = subject_result;

        /*
         * Limit the size. This should be done more efficiently during the process of
         * building up of the list.
         * Because the limit needs to be based on 'match number' ranking, which depends
         * on all terms, an efficient algorithm is not obvious.
         * Unfortunately, we also have to do this after processing all results because
         * we need (in fact more often) observation numbers as well in ranking. TODO
         */
        if (subject_result.size() > maxNumberOfSearchResults) {
            searchResults.oversized = subject_result.size();
            subject_result = subject_result.stream().sorted(new SearchResultComparator())
                    .limit(maxNumberOfSearchResults).collect(Collectors.toList());
            log.debug("size after limiting: " + subject_result.size());
        }

        searchResults.subject_result = subject_result;

        if (searchTerms.length <= 1) {
            return searchResults;
        }

        // add intersection of observations
        Set<Observation> set0 = observationMap.get(searchTerms[0]);
        if (set0 == null) {
            log.debug("no observation for " + searchTerms[0]);
            return searchResults;
        }
        log.debug("set0 size=" + set0.size());
        for (int i = 1; i < searchTerms.length; i++) {
            Set<Observation> obset = observationMap.get(searchTerms[i]);
            if (obset == null) {
                log.debug("... no observation for " + searchTerms[i]);
                return searchResults;
            }
            log.debug("set " + i + " size=" + obset.size());
            set0.retainAll(obset);
        }
        // set0 is now the intersection
        if (set0.size() == 0) {
            log.debug("no intersection of observations");
        }
        if (set0.size() > maxNumberOfSearchResults) {
            searchResults.oversized_observations = set0.size();
            // no particular ranking is enforced when limiting
            set0 = set0.stream().limit(maxNumberOfSearchResults).collect(Collectors.toSet());
            log.debug("observation results count after limiting: " + set0.size());
        }
        searchResults.observation_result = new ArrayList<Observation>(set0);

        return searchResults;
    }

    /*
     * this is meant to check whether a subject is observed or not in the most
     * efficient way
     */
    private boolean notObserved(int id) {
        Session session = getSession();
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<Integer> query = session
                .createNativeQuery("SELECT 1 FROM observed_subject WHERE subject_id=" + id + " LIMIT 1");
        boolean no = query.uniqueResult() == null;
        session.close();
        return no;
    }

    private int countObservation(Integer vaccine_db_id) {
        String sql = "SELECT COUNT(DISTINCT observation_id) FROM observed_subject"
                + " JOIN vaccine ON subject_id=vaccine.id  WHERE vaccine.id=" + vaccine_db_id;
        Session session = getSession();
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<BigInteger> query = session.createNativeQuery(sql);
        BigInteger count = query.getSingleResult();
        session.close();
        return count.intValue();
    }

    private List<Vaccine> searchVaccineByCode(String queryString) {
        Pattern VOCodePattern = Pattern.compile("(vo[:_])?(\\d{7})");
        Matcher matcher = VOCodePattern.matcher(queryString);
        List<String> codes = new ArrayList<String>();
        while (matcher.find()) {
            codes.add("VO_" + matcher.group(2));
        }
        if (codes.size() > 0) {
            Session session = getSession();
            session.setDefaultReadOnly(true);
            org.hibernate.query.Query<?> query = session.createQuery("FROM VaccineImpl WHERE vaccineID in (:codes)");
            query.setParameterList("codes", codes);
            @SuppressWarnings("unchecked")
            List<Vaccine> list = (List<Vaccine>) query.list();
            session.close();
            return list;
        } else {
            return new ArrayList<Vaccine>();
        }
    }

    @Override
    public List<ObservedSubject> findObservedSubjectByRole(String role) {
        return queryWithClass("from ObservedSubjectImpl where observedSubjectRole.subjectRole.displayName = :role",
                "role", role);
    }

    @Override
    public List<SubjectWithSummaries> findSubjectWithSummariesByRole(String role, Integer minScore) {
        return query2ParamsWithClass("from SubjectWithSummaries where role = :role and score > :score", "role", role,
                "score", minScore);
    }

    @Cacheable(value = "uniprotCache")
    @Override
    public List<Protein> findProteinByGene(Gene gene) {
        Set<Protein> proteins = new HashSet<Protein>();
        List<Transcript> transcriptList = queryWithClass("from TranscriptImpl where gene = :gene", "gene", gene);
        for (Transcript t : transcriptList) {
            List<Protein> list = queryWithClass("from ProteinImpl as p where :transcript member of p.transcripts",
                    "transcript", t);
            for (Protein p : list) {
                proteins.add(p);
            }
        }

        return (new ArrayList<Protein>(proteins));
    }

    private <E> List<E> queryWithClass(String queryString, String parameterName, Object valueObject) {
        assert queryString.contains(":" + parameterName);
        Session session = getSession();
        session.setDefaultReadOnly(true);
        org.hibernate.query.Query<?> query = session.createQuery(queryString);
        query.setParameter(parameterName, valueObject);
        @SuppressWarnings("unchecked")
        List<E> list = (List<E>) query.list();
        session.close();

        return list;
    }

    private <E> List<E> query2ParamsWithClass(String queryString, String parameterName1, Object valueObject1,
            String parameterName2, Object valueObject2) {
        assert queryString.contains(":" + parameterName1);
        assert queryString.contains(":" + parameterName2);
        Session session = getSession();
        session.setDefaultReadOnly(true);
        org.hibernate.query.Query<?> query = session.createQuery(queryString);
        query.setParameter(parameterName1, valueObject1).setParameter(parameterName2, valueObject2);
        @SuppressWarnings("unchecked")
        List<E> list = (List<E>) query.list();
        session.close();

        return list;
    }

    @Override
    public List<Vaccine> findVaccineByName(String name) {
        /* in the new input data, vaccine code is entered with : instead of _ */
        log.debug("vaccine name=" + name);
        return queryWithClass("from VaccineImpl where vaccineID = :name", "name", name.replace(":", "_"));
    }

    @Override
    public List<CellSubset> findCellSubsetByOntologyId(String ontologyId) {
        ontologyId = ontologyId.replace(":", "_");
        return queryWithClass("FROM CellSubsetImpl WHERE cellOntologyId = :oid", "oid", ontologyId);
    }

    @Override
    public List<Pathogen> findPathogenByTaxonomyId(String taxonomyId) {
        return queryWithClass("from PathogenImpl where taxonomyId = :taxonomyId", "taxonomyId", taxonomyId);
    }

    private static String createLikeClauses(String filterBy) {
        // process quote first
        Pattern p = Pattern.compile("\"(.+)\"");
        Matcher matcher = p.matcher(filterBy);
        List<String> terms = new ArrayList<String>();
        while (matcher.find()) {
            terms.add(matcher.group(1));
        }
        String[] unquoted = filterBy.replaceAll("\"(.+)\"", "").split("\\s");
        terms.addAll(Arrays.asList(unquoted));
        StringBuilder sb = new StringBuilder();
        for (String t : terms) {
            sb.append(" AND summary LIKE '%" + t + "%'");
        }
        return sb.toString();
    }

    @Override
    public Integer countObservationsFiltered(Integer subjectId, String filterBy) {
        Session session = getSession();
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<BigInteger> query = session.createNativeQuery(
                "SELECT COUNT(*) FROM expanded_summary JOIN observed_subject ON expanded_summary.observation_id=observed_subject.observation_id WHERE subject_id="
                        + subjectId + createLikeClauses(filterBy));
        BigInteger x = query.uniqueResult();
        session.close();
        return x.intValue();
    }

    @Override
    public List<Observation> getObservationsFiltered(Integer subjectId, String filterBy) {
        Session session = getSession();
        session.setDefaultReadOnly(true);
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<Integer> query = session.createNativeQuery(
                "SELECT expanded_summary.observation_id FROM expanded_summary JOIN observed_subject ON expanded_summary.observation_id=observed_subject.observation_id WHERE subject_id="
                        + subjectId + createLikeClauses(filterBy));
        List<Integer> list = query.list();
        List<Observation> observations = new ArrayList<Observation>();
        for (Integer id : list) {
            Observation observation = session.get(Observation.class, id);
            observations.add(observation);
        }
        session.close();
        return observations;
    }

    @Override
    public String[] getAllResponseAgents(Integer submissionId) {
        Session session = getSession();
        String sql = "SELECT DISTINCT dashboard_entity.displayName FROM observed_subject"
                + " JOIN dashboard_entity ON observed_subject.subject_id=dashboard_entity.id"
                + " JOIN observed_subject_role ON observed_subject.observedSubjectRole_id=observed_subject_role.id"
                + " JOIN submission ON observed_subject_role.observationTemplate_id=submission.observationTemplate_id"
                + " WHERE observed_subject_role.columnName='response_agent' AND submission.id=" + submissionId;
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<String> query = session.createNativeQuery(sql);
        List<String> list = query.list();
        session.close();
        return list.toArray(new String[list.size()]);
    }

    @Override
    public int getGeneNumber(String filterBy) {
        String sql = "SELECT count(*) FROM subject_with_summaries JOIN gene ON subject_id=gene.id";
        if (filterBy != null && filterBy.trim().length() > 0) {
            sql += " JOIN dashboard_entity ON subject_id=dashboard_entity.id WHERE displayName LIKE '%" + filterBy
                    + "%'";
        }
        Session session = getSession();
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<BigInteger> query = session.createNativeQuery(sql);
        int x = query.getSingleResult().intValue();
        session.close();
        return x;
    }

    @Override
    public GeneData[] getGeneData(int start, int length, String orderBy, String direction, String filterBy) {
        if (filterBy == null) {
            filterBy = "";
        }
        if (filterBy.trim().length() > 0) {
            filterBy = " WHERE displayName LIKE '%" + filterBy + "%'";
        }
        Session session = getSession();
        String sql = "SELECT displayName, numberofObservations, stableURL FROM subject_with_summaries"
                + " JOIN gene ON subject_id=gene.id" + " JOIN subject ON subject_id=subject.id"
                + " JOIN dashboard_entity ON subject_id=dashboard_entity.id" + filterBy + " ORDER BY " + orderBy + " "
                + direction + " LIMIT " + length + " OFFSET " + start;
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<Object[]> query = session.createNativeQuery(sql);
        List<Object[]> list = query.list();
        session.close();
        GeneData[] a = new GeneData[list.size()];
        for (int i = 0; i < list.size(); i++) {
            Object[] obj = list.get(i);
            String symbol = (String) obj[0];
            int numberOfObservations = (int) obj[1];
            String url = (String) obj[2];
            a[i] = new GeneData(symbol, url, numberOfObservations);
        }
        return a;
    }

    @Override
    public String[][] getAllGeneData(String orderBy, String direction, String filterBy) {
        if (filterBy == null) {
            filterBy = "";
        }
        if (filterBy.trim().length() > 0) {
            filterBy = " WHERE displayName LIKE '%" + filterBy + "%'";
        }
        Session session = getSession();
        String sql = "SELECT displayName, numberOfObservations FROM subject_with_summaries"
                + " JOIN gene ON subject_id=gene.id" + " JOIN subject ON subject_id=subject.id"
                + " JOIN dashboard_entity ON subject_id=dashboard_entity.id" + filterBy + " ORDER BY " + orderBy + " "
                + direction;
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<Object[]> query = session.createNativeQuery(sql);
        List<Object[]> list = query.list();
        session.close();
        String[][] a = new String[list.size()][2];
        for (int i = 0; i < list.size(); i++) {
            Object[] obj = list.get(i);
            a[i][0] = obj[0].toString();
            a[i][1] = obj[1].toString();
        }
        return a;
    }

    @Override
    public List<PMIDResult> getPMIDs() {
        Session session = getSession();
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<Object[]> query = session.createNativeQuery(
            "SELECT PMID, description, submissionDate, COUNT(*) FROM observation_template"
            + " JOIN submission on observation_template.id=submission.observationTemplate_id"
            + " GROUP BY PMID, description, submissionDate");
        List<Object[]> objList = query.list();
        List<PMIDResult> list = new ArrayList<PMIDResult>();
        for (int i = 0; i < objList.size(); i++) {
            Object[] obj = objList.get(i);
            Integer pmid = (Integer)obj[0];
            String description = (String)obj[1];
            Date date = (Date)obj[2];
            BigInteger count = (BigInteger)obj[3];
            list.add(new PMIDResult(pmid, description, date, count.intValue()));
        }
        session.close();
        return list;
    }

    @Override
    public List<Submission> getSubmissionsPerPMID(Integer pmid) {
        return queryWithClass("from SubmissionImpl where observationTemplate.PMID = :pmid", "pmid", pmid);
    }

    /* this query is to emulate the explore pages */
    @Override
    public WordCloudEntry[] getSubjectCountsForRole(String role) {
        String role_condition = "";
        if (role != null && role.trim().length() > 0)
            role_condition = " AND role = '" + role + "'";
        List<WordCloudEntry> list = new ArrayList<WordCloudEntry>();
        // four possible roles: cell_biomarker, vaccine, pathogen, tissue
        String sql = "SELECT displayName, numberOfObservations, stableURL FROM subject_with_summaries"
                + " JOIN subject ON subject_with_summaries.subject_id=subject.id"
                + " JOIN dashboard_entity ON subject.id=dashboard_entity.id"
                + " WHERE score>1" + role_condition + " ORDER BY numberOfObservations DESC LIMIT 250";
        if (role!=null && role.equalsIgnoreCase("genes")) {
            sql = "SELECT displayName, numberOfObservations, stableURL FROM subject_with_summaries"
            + " JOIN gene ON subject_id=gene.id" + " JOIN subject ON subject_id=subject.id"
            + " JOIN dashboard_entity ON subject_id=dashboard_entity.id" + " ORDER BY numberOfObservations DESC LIMIT 250";
        }
        log.debug(sql);
        Session session = getSession();
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<Object[]> query = session.createNativeQuery(sql);
        for (Object[] obj : query.getResultList()) {
            String subject = (String) obj[0];
            String fullname = null;
            if (subject.length() > ABBREVIATION_LENGTH_LIMIT) {
                fullname = subject;
                subject = shortenSubjectName(subject);
            }
            Integer count = (Integer) obj[1];
            String url = (String) obj[2];
            list.add(new WordCloudEntry(subject, count, url, fullname));
        }
        session.close();
        return list.toArray(new WordCloudEntry[0]);
    }

    private final static int ABBREVIATION_LENGTH_LIMIT = 15;
    private final static List<Character> vowels = Arrays.asList('a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U');

    /*
     * shorten the subject name using the specific steps described in the word-cloud
     * spec
     */
    static private String shortenSubjectName(String longName) {
        log.debug("long name to be shortened: " + longName);
        String[] x = longName.split("\\s");
        if (x.length == 1) {
            return longName.substring(0, ABBREVIATION_LENGTH_LIMIT);
        } else {
            final int N = 4;
            StringBuffer shortened = new StringBuffer();
            for (int index = 0; index < x.length; index++) {
                if (index > 0) {
                    shortened.append(".");
                }

                String word = x[index];
                int count = word.length();
                int firstVowel = 1;
                while (firstVowel < count && !vowels.contains(word.charAt(firstVowel))) {
                    firstVowel++;
                }
                if (firstVowel > N) {
                    shortened.append(word.substring(0, N));
                    continue;
                }
                int afterVowelSequence = firstVowel + 1;
                while (afterVowelSequence < count && vowels.contains(word.charAt(afterVowelSequence))) {
                    afterVowelSequence++;
                }
                if (afterVowelSequence > N) {
                    shortened.append(word.substring(0, N));
                    continue;
                }
                while (count > N) { // still too long
                    int lastVowel = count - 1;
                    while (lastVowel >= afterVowelSequence && !vowels.contains(word.charAt(lastVowel))) {
                        lastVowel--;
                    }
                    // lastVowel is the position of the last vowel
                    if (lastVowel > afterVowelSequence) {// remove the last vowel;
                        word = word.substring(0, lastVowel) + word.substring(lastVowel + 1, count);
                    } else {
                        word = word.substring(0, count - 1); // remove the last character;
                    }
                    count--;
                }
                shortened.append(word);
            }
            log.debug("shortened name: " + shortened);
            return shortened.toString();
        }
    }

    @Override
    public WordCloudEntry[] getSubjectCounts(Integer associatedSubject) {
        String sqlForObservations = "SELECT DISTINCT observation_id FROM observed_subject WHERE subject_id="
                + associatedSubject;
        Session session = getSession();
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<Integer> query3 = session.createNativeQuery(sqlForObservations);
        List<Integer> observationIds = query3.getResultList();
        StringBuffer idList = new StringBuffer("0"); // ID=0 is not any object
        for (Integer observationId : observationIds) {
            idList.append("," + observationId);
        }

        List<WordCloudEntry> list = new ArrayList<WordCloudEntry>();
        String sql = "SELECT displayName, count(*) AS x, stableURL FROM observed_subject"
                + " JOIN dashboard_entity ON observed_subject.subject_id=dashboard_entity.id"
                + " JOIN subject ON observed_subject.subject_id=subject.id" + " WHERE subject.id!=" + associatedSubject
                + " AND observation_id IN (" + idList + ") GROUP BY subject.id ORDER BY x DESC LIMIT 250";
        log.debug(sql);
        @SuppressWarnings("unchecked")
        org.hibernate.query.Query<Object[]> query = session.createNativeQuery(sql);
        for (Object[] obj : query.getResultList()) {
            String subject = (String) obj[0];
            String fullname = null;
            if (subject.length() > ABBREVIATION_LENGTH_LIMIT) {
                fullname = subject;
                subject = shortenSubjectName(subject);
            }
            Integer count = ((BigInteger) obj[1]).intValue();
            String url = (String) obj[2];
            list.add(new WordCloudEntry(subject, count, url, fullname));
        }
        session.close();
        return list.toArray(new WordCloudEntry[0]);
    }
}
