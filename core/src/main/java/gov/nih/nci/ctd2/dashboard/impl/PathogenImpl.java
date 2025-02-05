package gov.nih.nci.ctd2.dashboard.impl;

import gov.nih.nci.ctd2.dashboard.model.Pathogen;
import gov.nih.nci.ctd2.dashboard.model.Synonym;
import java.util.LinkedHashSet;
import java.util.Set;
import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;
import org.hibernate.annotations.Proxy;
import org.hibernate.search.annotations.Analyze;
import org.hibernate.search.annotations.Analyzer;
import org.hibernate.search.annotations.Field;
import org.hibernate.search.annotations.Fields;
import org.hibernate.search.annotations.Indexed;
import org.hibernate.search.annotations.Store;

import javax.persistence.*;

@Entity
@Proxy(proxyClass = Pathogen.class)
@Table(name = "pathogen")
@Indexed
public class PathogenImpl extends SubjectImpl implements Pathogen {

	private static final long serialVersionUID = -4774943578771816570L;

	private String taxonomyId;
	private String rank;
	private Set<Synonym> exactSynonyms = new LinkedHashSet<Synonym>();
	private Set<Synonym> relatedSynonyms = new LinkedHashSet<Synonym>();

	@LazyCollection(LazyCollectionOption.FALSE)
	@OneToMany(targetEntity = SynonymImpl.class, cascade = CascadeType.ALL)
	@JoinTable(name = "pathogen_exact_synonym_map")
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
	@JoinTable(name = "pathogen_related_synonym_map")
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
	@Column(name = "pathogen_rank")
	public String getRank() {
		return rank;
	}

	@Override
	public void setRank(String rank) {
		this.rank = rank;
	}

    @Fields({
        @Field(name = FIELD_SYNONYM, index = org.hibernate.search.annotations.Index.YES, store = Store.YES),
        @Field(name = FIELD_SYNONYM_WS, index = org.hibernate.search.annotations.Index.YES, store = Store.YES, analyzer = @Analyzer(definition = "ctd2analyzer")),
        @Field(name = FIELD_SYNONYM_UT, index = org.hibernate.search.annotations.Index.YES, analyze=Analyze.NO)
    })
    @Transient
    public String getExactSynoynmStrings() {
        StringBuilder builder = new StringBuilder();
        for (Synonym synonym : getExactSynonyms()) {
            builder.append(synonym.getDisplayName()).append(" ");
        }
        return builder.toString();
    }
}
