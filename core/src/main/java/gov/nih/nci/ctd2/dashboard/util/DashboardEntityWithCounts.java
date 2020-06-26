package gov.nih.nci.ctd2.dashboard.util;

import gov.nih.nci.ctd2.dashboard.model.DashboardEntity;

import java.io.Serializable;

public class DashboardEntityWithCounts implements Serializable {
    private static final long serialVersionUID = -1315522615138058767L;
    private DashboardEntity dashboardEntity;
    private int observationCount = 0;
    private int centerCount = 0;
    private int maxTier = 0;
    private String role = "";

    public DashboardEntity getDashboardEntity() {
        return dashboardEntity;
    }

    public void setDashboardEntity(DashboardEntity dashboardEntity) {
        this.dashboardEntity = dashboardEntity;
    }

    public int getObservationCount() {
        return observationCount;
    }

    public void setObservationCount(int observationCount) {
        this.observationCount = observationCount;
    }

    public int getCenterCount() {
        return centerCount;
    }

    public void setCenterCount(int centerCount) {
        this.centerCount = centerCount;
    }

    public int getMaxTier() {
        return maxTier;
    }

    public void setMaxTier(int maxTier) {
        this.maxTier = maxTier;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
