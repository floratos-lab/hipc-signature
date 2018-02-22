package gov.nih.nci.ctd2.dashboard.impl;

import gov.nih.nci.ctd2.dashboard.model.Pathogen;
import gov.nih.nci.ctd2.dashboard.model.Synonym;
import java.util.LinkedHashSet;
import java.util.Set;
import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;
import org.hibernate.annotations.Proxy;
import org.hibernate.search.annotations.Indexed;

import javax.persistence.*;

@Entity
@Proxy(proxyClass = Pathogen.class)
@Table(name = "pathogen")
@Indexed
public class PathogenImp extends SubjectImpl implements Pathogen {

	private static final long serialVersionUID = -4774943578771816570L;

	private String taxonomyId;
    private String rank;
	private Set<Synonym> exactSynonyms = new LinkedHashSet<Synonym>();
	private Set<Synonym> relatedSynonyms = new LinkedHashSet<Synonym>();

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

	@Override
	public String getTaxonomyId() {
		return taxonomyId;
	}

	@Override
	public void setTaxonomyId(String taxonomyId) {
		this.taxonomyId = taxonomyId;
	}

	@Override
	public String getRank() {
		return rank;
	}

	@Override
	public void setRank(String rank) {
		this.rank = rank;
	}

}
