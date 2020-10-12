package gov.nih.nci.ctd2.dashboard.util;

import java.util.Date;

public class PMIDResult {
    final public Integer pmid;
    final public String description;
    final public Date publicationDate;
    final public Integer observationNumber;
    public PMIDResult(Integer pmid, String description, Date publicationDate, Integer observationNumber){
        this.pmid = pmid;
        this.description = description;
        this.publicationDate = publicationDate;
        this.observationNumber = observationNumber;
    }
}
