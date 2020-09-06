package gov.nih.nci.ctd2.dashboard.impl;

import gov.nih.nci.ctd2.dashboard.model.CellSubset;
import gov.nih.nci.ctd2.dashboard.model.Synonym;
import java.util.LinkedHashSet;
import java.util.Set;
import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;
import org.hibernate.annotations.Proxy;
import org.hibernate.search.annotations.Indexed;

import javax.persistence.*;

@Entity
@Proxy(proxyClass = CellSubset.class)
@Table(name = "cellsubset")
@Indexed
public class CellSubsetImpl extends SubjectImpl implements CellSubset {

	private static final long serialVersionUID = -4774943578771816570L;

	private String cellOntologyId;
    private String definition;
	private String comment;
	private Set<Synonym> exactSynonyms = new LinkedHashSet<Synonym>();
	private Set<Synonym> relatedSynonyms = new LinkedHashSet<Synonym>();

	@Override
	public String getCellOntologyId() {
		return cellOntologyId;
	}

	@Override
	public void setCellOntologyId(String cellOntologyId) {
		this.cellOntologyId = cellOntologyId;
	}

	@Column(length = 2048)
	@Override
	public String getDefinition() {
		return definition;
	}

	@Override
	public void setDefinition(String definition) {
		this.definition = definition;
	}

	@Column(length = 2048)
	@Override
	public String getComment() {
		return comment;
	}

	@Override
	public void setComment(String comment) {
		this.comment = comment;
	}

	@LazyCollection(LazyCollectionOption.FALSE)
    @OneToMany(targetEntity = SynonymImpl.class, cascade = CascadeType.ALL)
	@JoinTable(name = "exact_synonym_map")
	@Override
	public Set<Synonym> getExactSynonyms() {
		return exactSynonyms;
	}

	@Override
	public void setExactSynonyms(Set<Synonym> exactSynonyms) {
		this.exactSynonyms = exactSynonyms;
	}

	@LazyCollection(LazyCollectionOption.FALSE)
    @OneToMany(targetEntity = SynonymImpl.class, cascade = CascadeType.ALL)
	@JoinTable(name = "related_synonym_map")
	@Override
	public Set<Synonym> getRelatedSynonyms() {
		return relatedSynonyms;
	}

	@Override
	public void setRelatedSynonyms(Set<Synonym> relatedSynonyms) {
		this.relatedSynonyms = relatedSynonyms;
	}

}
