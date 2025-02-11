package gov.nih.nci.ctd2.dashboard.util;

import java.util.Date;
import java.util.List;
import gov.nih.nci.ctd2.dashboard.model.Observation;

public class SearchResults {
    public List<SubjectResult> subject_result;
    public List<StudyResult> study_result;
    public List<Observation> observation_result;

    public Boolean isEmpty() {
        return (subject_result == null || subject_result.isEmpty())
                && (study_result == null || study_result.isEmpty())
                && (observation_result == null || observation_result.isEmpty());
    }

    public int numberOfSubjects() {
        if (subject_result == null)
            return 0;
        else
            return subject_result.size();
    }

    // if greater 0, it shows the total number of results when the return size is
    // limited
    public int oversized = 0; // 'subjects', including ECO terms
    public int oversized_observations = 0;

    /*
     * this packs only the fields that are needed by the front-end
     */
    public static class StudyResult {
        final public Date publicationDate;
        final public String description;
        final public Integer pmid;
        final public Integer numberOfSignatures;
        public Integer matchNumber = 1;

        public StudyResult(Date publicationDate, String description, Integer pmid,
                Integer numberOfSignatures) {
            this.publicationDate = publicationDate;
            this.description = description;
            this.pmid = pmid;
            this.numberOfSignatures = numberOfSignatures;
        }

        @Override
        public boolean equals(Object obj) {
            if(!(obj instanceof StudyResult)) return false;
            StudyResult x = (StudyResult)obj;
            if(x.pmid==this.pmid) return true;
            else return false;
        }

        @Override
        public int hashCode() {
            return pmid.hashCode();
        }
    }
}
