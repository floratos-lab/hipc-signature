package gov.nih.nci.ctd2.dashboard.model;

import java.util.Set;

public interface Gene extends SubjectWithOrganism {
    String getEntrezGeneId();

    void setEntrezGeneId(String entrezGeneId);

    String getHGNCId();

    void setHGNCId(String hgncId);

    String getFullName();

    void setFullName(String fn);

    GeneType getGeneType();

    void setGeneType(GeneType gt);

    String getMapLocation();

    void setMapLocation(String ml);

    Set<Synonym> getOtherDesignations();
    void setOtherDesignations(Set<Synonym> synonyms);
}
