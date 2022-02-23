package gov.nih.nci.ctd2.dashboard.impl;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;
import org.hibernate.annotations.Proxy;

import gov.nih.nci.ctd2.dashboard.model.Protein;
import gov.nih.nci.ctd2.dashboard.model.Transcript;

@Entity
@Proxy(proxyClass = Protein.class)
@Table(name = "protein")
public class ProteinImpl extends SubjectWithOrganismImpl implements Protein {
    private static final long serialVersionUID = -2908682202730022719L;
    private String uniprotId;
    private Set<Transcript> transcripts = new HashSet<Transcript>();

    @Column(length = 64, nullable = false, unique = true)
    public String getUniprotId() {
        return uniprotId;
    }

    public void setUniprotId(String uniprotId) {
        this.uniprotId = uniprotId;
    }

    @LazyCollection(LazyCollectionOption.FALSE)
    @ManyToMany(targetEntity = TranscriptImpl.class)
    @JoinTable(name = "protein_transcript_map")
    public Set<Transcript> getTranscripts() {
        return transcripts;
    }

    public void setTranscripts(Set<Transcript> transcripts) {
        this.transcripts = transcripts;
    }
}
