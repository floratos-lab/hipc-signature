package gov.nih.nci.ctd2.dashboard.model;

import java.util.Set;

public interface Pathogen extends Subject {
    public String getTaxonomyId();
    public void setTaxonomyId(String taxonomyId);
    public String getRank();
    public void setRank(String rank);
    /* Subject.synonym is interpred as "Broad synonyms" for Pathongen. */
    public Set<Synonym> getExactSynonyms();
    public void setExactSynonyms(Set<Synonym> exactSynonyms);
    public Set<Synonym> getRelatedSynonyms();
    public void setRelatedSynonyms(Set<Synonym> relatedSynonyms);
}
