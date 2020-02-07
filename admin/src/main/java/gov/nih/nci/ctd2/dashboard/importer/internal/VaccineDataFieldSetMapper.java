package gov.nih.nci.ctd2.dashboard.importer.internal;

import gov.nih.nci.ctd2.dashboard.model.Vaccine;
import gov.nih.nci.ctd2.dashboard.model.DashboardFactory;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindException;
import org.springframework.batch.item.file.transform.FieldSet;
import org.springframework.batch.item.file.mapping.FieldSetMapper;
import org.springframework.beans.factory.annotation.Autowired;

@Component("vaccineDataMapper")
public class VaccineDataFieldSetMapper implements FieldSetMapper<Vaccine> {

	private static final Log log = LogFactory.getLog(VaccineDataFieldSetMapper.class);

	private static final String NAME = "name";
	private static final String VACCINE_ID = "vaccine_id";
	private static final String PRODCT_NAME = "product_name";
	private static final String TRADE_NAME = "trade_name";

	@Autowired
	private DashboardFactory dashboardFactory;

	public Vaccine mapFieldSet(final FieldSet fieldSet) throws BindException {

		String name = fieldSet.readString(NAME);
		final String id = fieldSet.readString(VACCINE_ID);
		final String productName = fieldSet.readString(PRODCT_NAME);
		final String tradeName = fieldSet.readString(TRADE_NAME);

		if (name.length() > 255) {
			log.warn("name for " + id + " is too long for a displayName (" + name + "). It is shorterned.");
			name = name.substring(0, 255);
		}

		final Vaccine vaccine = dashboardFactory.create(Vaccine.class);
		vaccine.setDisplayName(name);
		vaccine.setVaccineID(id);
		vaccine.setProductName(productName);
		vaccine.setTradeName(tradeName);

		return vaccine;
	}
}
