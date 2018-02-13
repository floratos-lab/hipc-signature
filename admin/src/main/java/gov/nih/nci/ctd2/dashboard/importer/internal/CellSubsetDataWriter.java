package gov.nih.nci.ctd2.dashboard.importer.internal;

import gov.nih.nci.ctd2.dashboard.dao.DashboardDao;
import gov.nih.nci.ctd2.dashboard.model.CellSubset;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Component("cellSubsetDataWriter")
public class CellSubsetDataWriter implements ItemWriter<CellSubset> {

    @Autowired
	private DashboardDao dashboardDao;
 
	private static final Log log = LogFactory.getLog(CellSubsetDataWriter.class);

    @Autowired
    @Qualifier("indexBatchSize")
    private Integer batchSize;
 
	public void write(List<? extends CellSubset> items) throws Exception {
        dashboardDao.batchSave(items, batchSize);
        log.debug("cell subset saved");
	}
}
