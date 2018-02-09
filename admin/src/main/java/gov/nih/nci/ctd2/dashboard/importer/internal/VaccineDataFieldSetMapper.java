package gov.nih.nci.ctd2.dashboard.importer.internal;

import gov.nih.nci.ctd2.dashboard.model.Vaccine;
import gov.nih.nci.ctd2.dashboard.model.DashboardFactory;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindException;
import org.springframework.batch.item.file.transform.FieldSet;
import org.springframework.batch.item.file.mapping.FieldSetMapper;
import org.springframework.beans.factory.annotation.Autowired;

@Component("vaccineDataMapper")
public class VaccineDataFieldSetMapper implements FieldSetMapper<Vaccine> {

	private static final String NAME = "name";
	private static final String	VACCINE_ID = "vaccine_id";
	private static final String	PRODCT_NAME = "product_name";
	private static final String	TRADE_NAME = "trade_name";

    @Autowired
    private DashboardFactory dashboardFactory;

	public Vaccine mapFieldSet(FieldSet fieldSet) throws BindException {

		String name = fieldSet.readString(NAME);
		String id = fieldSet.readString(VACCINE_ID);
		String productName = fieldSet.readString(PRODCT_NAME);
		String tradeName = fieldSet.readString(TRADE_NAME);

		Vaccine vaccine = dashboardFactory.create(Vaccine.class);
		vaccine.setDisplayName(name);
		vaccine.setVaccineID(id);
		vaccine.setProductName(productName);
		vaccine.setTradeName(tradeName);

		return vaccine;
	}
}
