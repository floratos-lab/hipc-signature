package gov.nih.nci.ctd2.dashboard.impl;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.Table;

import org.apache.solr.analysis.LowerCaseFilterFactory;
import org.apache.solr.analysis.StopFilterFactory;
import org.apache.solr.analysis.WhitespaceTokenizerFactory;
import org.hibernate.annotations.Proxy;
import org.hibernate.search.annotations.Analyze;
import org.hibernate.search.annotations.AnalyzerDef;
import org.hibernate.search.annotations.Field;
import org.hibernate.search.annotations.Fields;
import org.hibernate.search.annotations.Indexed;
import org.hibernate.search.annotations.Parameter;
import org.hibernate.search.annotations.Store;
import org.hibernate.search.annotations.TokenFilterDef;
import org.hibernate.search.annotations.TokenizerDef;

import gov.nih.nci.ctd2.dashboard.model.DashboardEntity;

@AnalyzerDef(name="ctd2analyzer",
  tokenizer = @TokenizerDef(factory = WhitespaceTokenizerFactory.class),
  filters = {
    @TokenFilterDef(factory = LowerCaseFilterFactory.class),
    @TokenFilterDef(factory = StopFilterFactory.class, params = {
      @Parameter(name="ignoreCase", value="true")
    })
})
@Entity
@Proxy(proxyClass= DashboardEntity.class)
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "dashboard_entity",
        indexes = { @Index(name = "entityNameIdx", columnList = "displayName" )
})
@Indexed
public class DashboardEntityImpl implements DashboardEntity {
    private static final long serialVersionUID = 6953675960325146562L;
    public final static String FIELD_DISPLAYNAME = "keyword";
    public final static String FIELD_DISPLAYNAME_UT = "keywordUT";

    private Integer id;
    private String displayName;

    @Fields({
        @Field(name = FIELD_DISPLAYNAME, index = org.hibernate.search.annotations.Index.YES, store = Store.YES),
        @Field(name = FIELD_DISPLAYNAME_UT, index = org.hibernate.search.annotations.Index.YES, analyze = Analyze.NO)
    })
    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        DashboardEntityImpl that = (DashboardEntityImpl) o;
        if(this.getId() == null || that.getId() == null)
            return super.equals(o);

        if (id != null ? !id.equals(that.id) : that.id != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : super.hashCode();
    }
}
