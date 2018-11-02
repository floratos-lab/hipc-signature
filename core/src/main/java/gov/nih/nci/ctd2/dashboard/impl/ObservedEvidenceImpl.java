package gov.nih.nci.ctd2.dashboard.impl;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.annotations.Proxy;

import gov.nih.nci.ctd2.dashboard.model.Evidence;
import gov.nih.nci.ctd2.dashboard.model.Observation;
import gov.nih.nci.ctd2.dashboard.model.ObservedEvidence;
import gov.nih.nci.ctd2.dashboard.model.ObservedEvidenceRole;

@Entity
@Proxy(proxyClass = ObservedEvidence.class)
@Table(name = "observed_evidence")
public class ObservedEvidenceImpl extends DashboardEntityImpl implements ObservedEvidence {
    private static final long serialVersionUID = -2396850548185168890L;
    private Evidence evidence;
    private ObservedEvidenceRole observedEvidenceRole;
    private Observation observation;

    @ManyToOne(targetEntity = EvidenceImpl.class)
    public Evidence getEvidence() {
        return evidence;
    }

    public void setEvidence(Evidence evidence) {
        this.evidence = evidence;
    }

    @ManyToOne(targetEntity = ObservedEvidenceRoleImpl.class)
    public ObservedEvidenceRole getObservedEvidenceRole() {
        return observedEvidenceRole;
    }

    public void setObservedEvidenceRole(ObservedEvidenceRole observedEvidenceRole) {
        this.observedEvidenceRole = observedEvidenceRole;
    }

    @ManyToOne(targetEntity = ObservationImpl.class)
    public Observation getObservation() {
        return observation;
    }

    public void setObservation(Observation observation) {
        this.observation = observation;
    }
}
