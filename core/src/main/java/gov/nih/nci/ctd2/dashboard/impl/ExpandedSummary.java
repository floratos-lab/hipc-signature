package gov.nih.nci.ctd2.dashboard.impl;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import gov.nih.nci.ctd2.dashboard.model.DashboardEntity;

/* This is for generating an 'expanded_summary' table to support the filtering feature,
so does not extend DashboardEntity by design to avoid unneccessary records in dashboard_entity table.
*/
@Entity
@Table(name = "expanded_summary")
public class ExpandedSummary implements DashboardEntity {

    private static final long serialVersionUID = 4830155931342066550L;

    @Id
    @Column(name = "observation_id")
    private Integer id;

    @Column(name = "summary", length = 1024)
    private String summary;

    public ExpandedSummary(Integer id, String summary) {
        this.id = id;
        this.summary = summary;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getDisplayName() {
        return summary;
    }

    public void setDisplayName(String summary) {
        this.summary = summary;
    }

}
