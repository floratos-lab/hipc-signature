package gov.nih.nci.ctd2.dashboard.model;

public interface Vaccine extends Subject {
    /* Canical Name is the DashboardEntity DisplayName */
	public String getVaccineID();
    public void setVaccineID(String vaccineID);
    public String getVaccineProperName();
    public void setVaccineProperName(String vaccineProperName);
    public String getTradeName();
    public void setTradeName(String tradeName);
}
