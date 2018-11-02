package gov.nih.nci.ctd2.dashboard.impl;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;
import org.hibernate.annotations.Proxy;
import org.hibernate.search.annotations.Indexed;

import gov.nih.nci.ctd2.dashboard.model.Annotation;
import gov.nih.nci.ctd2.dashboard.model.CellSample;

@Entity
@Proxy(proxyClass= CellSample.class)
@Table(name = "cell_sample")
@Indexed
public class CellSampleImpl extends SubjectWithOrganismImpl implements CellSample {
    private static final long serialVersionUID = -513131580618638396L;
    private String gender;
    private Set<Annotation> annotations = new HashSet<Annotation>();

    @Column(length = 128, nullable = true)
    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    @LazyCollection(LazyCollectionOption.FALSE)
    @ManyToMany(targetEntity = AnnotationImpl.class, cascade = CascadeType.ALL)
    @JoinTable(name = "cell_sample_annotation_map")
    public Set<Annotation> getAnnotations() {
        return annotations;
    }

    public void setAnnotations(Set<Annotation> annotations) {
        this.annotations = annotations;
    }
}
