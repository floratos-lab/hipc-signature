package gov.nih.nci.ctd2.dashboard.impl;

import gov.nih.nci.ctd2.dashboard.model.Vaccine;
import org.hibernate.annotations.Proxy;
import org.hibernate.search.annotations.Indexed;

import javax.persistence.*;

@Entity
@Proxy(proxyClass = Vaccine.class)
@Table(name = "vaccine")
@Indexed
public class VaccineImpl extends SubjectImpl implements Vaccine {
    private static final long serialVersionUID = 4160496817948202967L;

    private String vaccineID;
    private String vaccineProperName;
    private String tradeName;

    @Override
	public String getVaccineID() {
		return vaccineID;
	}
	@Override
	public void setVaccineID(String vaccineID) {
        this.vaccineID = vaccineID;
	}
	@Override
	public String getVaccineProperName() {
		return vaccineProperName;
	}
	@Override
	public void setVaccineProperName(String vaccineProperName) {
		this.vaccineProperName = vaccineProperName;
	}
	@Override
	public String getTradeName() {
		return tradeName;
	}
	@Override
	public void setTradeName(String tradeName) {
		this.tradeName = tradeName;
	}

}
