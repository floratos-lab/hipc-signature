package gov.nih.nci.ctd2.dashboard.importer.internal;

import gov.nih.nci.ctd2.dashboard.dao.DashboardDao;
import gov.nih.nci.ctd2.dashboard.model.Pathogen;
import gov.nih.nci.ctd2.dashboard.util.StableURL;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Component("pathogenDataWriter")
public class PathogenDataWriter implements ItemWriter<Pathogen> {

    @Autowired
	private DashboardDao dashboardDao;
 
	private static final Log log = LogFactory.getLog(PathogenDataWriter.class);

    @Autowired
    @Qualifier("indexBatchSize")
    private Integer batchSize;
 
	public void write(List<? extends Pathogen> items) throws Exception {
        for(Pathogen pathogen: items) {
            String stableURL = new StableURL().createURLWithPrefix("pathogen", pathogen.getTaxonomyId());
            pathogen.setStableURL(stableURL);
        }
        dashboardDao.batchSave(items, batchSize);
        log.debug("pathogen saved");
	}
}
