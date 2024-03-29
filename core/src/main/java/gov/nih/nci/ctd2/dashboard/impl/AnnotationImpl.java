package gov.nih.nci.ctd2.dashboard.impl;

import gov.nih.nci.ctd2.dashboard.model.Annotation;
import org.hibernate.annotations.Proxy;

import javax.persistence.*;

@Entity
@Proxy(proxyClass = Annotation.class)
@Table(name = "annotation")
public class AnnotationImpl extends SubjectImpl implements Annotation {
    private static final long serialVersionUID = -6638963618040537372L;
    private String source;
    private String type;

    @Column(length = 128, nullable = false)
    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    @Column(length = 128, nullable = false)
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
