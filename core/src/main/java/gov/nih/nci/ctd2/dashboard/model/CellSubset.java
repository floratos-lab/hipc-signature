package gov.nih.nci.ctd2.dashboard.model;

import java.util.Set;

public interface CellSubset extends Subject {
    public String getCellOntologyId();
    public void setCellOntologyId(String cellOntologyId);
    public String getDefinition();
    public void setDefinition(String definition);
    public String getComment();
    public void setComment(String comment);
    /* Subject.synonym is interpred as "Broad synonyms " for Cell Subset. */
    public Set<Synonym> getExactSynonyms();
    public void setExactSynonyms(Set<Synonym> exactSynonyms);
    public Set<Synonym> getRelatedSynonyms();
    public void setRelatedSynonyms(Set<Synonym> relatedSynonyms);
}
