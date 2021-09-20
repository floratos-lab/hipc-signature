package gov.nih.nci.ctd2.dashboard.impl;

import java.util.LinkedHashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Index;
import javax.persistence.JoinTable;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;
import org.hibernate.annotations.Proxy;
import org.hibernate.search.annotations.Field;
import org.hibernate.search.annotations.Indexed;

import gov.nih.nci.ctd2.dashboard.model.Gene;
import gov.nih.nci.ctd2.dashboard.model.GeneType;
import gov.nih.nci.ctd2.dashboard.model.Synonym;

@Entity
@Proxy(proxyClass = Gene.class)
@Table(name = "gene", indexes = { @Index(name = "geneHgncIdx", columnList = "hgncId") })
@Indexed
public class GeneImpl extends SubjectWithOrganismImpl implements Gene {
    private static final long serialVersionUID = 3479333253065758075L;
    public final static String FIELD_ENTREZID = "entrezid";
    public final static String FIELD_HGNCID = "hgncid";

    private String entrezGeneId;
    private String hgncId;
    private String fullName;
    private GeneType geneType;
    private String mapLocation;
    private Set<Synonym> otherDesignations = new LinkedHashSet<Synonym>();;

    @Field(name = FIELD_ENTREZID, index = org.hibernate.search.annotations.Index.YES)
    @Column(length = 32, nullable = false, unique = true)
    public String getEntrezGeneId() {
        return entrezGeneId;
    }

    public void setEntrezGeneId(String entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
    }

    @Field(name = FIELD_HGNCID, index = org.hibernate.search.annotations.Index.YES)
    @Column(length = 32, nullable = true)
    public String getHGNCId() {
        return hgncId;
    }

    public void setHGNCId(String hgncId) {
        this.hgncId = hgncId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fn) {
        fullName = fn;
    }

    @ManyToOne(targetEntity = GeneTypeImpl.class)
    public GeneType getGeneType() {
        return geneType;
    }

    public void setGeneType(GeneType gt) {
        geneType = gt;
    }

    public String getMapLocation() {
        return mapLocation;
    }

    public void setMapLocation(String ml) {
        mapLocation = ml;
    }

    @LazyCollection(LazyCollectionOption.FALSE)
    @OneToMany(targetEntity = SynonymImpl.class, cascade = CascadeType.ALL)
    @JoinTable(name = "gene_other_designations_map")
    @Override
    public Set<Synonym> getOtherDesignations() {
        return otherDesignations;
    }

    @Override
    public void setOtherDesignations(Set<Synonym> otherDesignations) {
        this.otherDesignations = otherDesignations;
    }
}
