package gov.nih.nci.ctd2.dashboard.importer.internal;

import gov.nih.nci.ctd2.dashboard.model.Pathogen;
import gov.nih.nci.ctd2.dashboard.model.DashboardFactory;
import gov.nih.nci.ctd2.dashboard.model.Synonym;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindException;
import org.springframework.batch.item.file.transform.FieldSet;
import org.springframework.batch.item.file.mapping.FieldSetMapper;
import org.springframework.beans.factory.annotation.Autowired;

@Component("pathogenDataFieldSetMapper")
public class PathogenDataFieldSetMapper implements FieldSetMapper<Pathogen> {

	private static final String NAME = "name";
	private static final String	ID = "id";
	private static final String	RANK = "rank";
	private static final String	BROAD_SYNONYM = "broad";
	private static final String	EXACT_SYNONYM = "exact";
	private static final String	RELATED_SYNONYM = "related";

    @Autowired
    private DashboardFactory dashboardFactory;

	public Pathogen mapFieldSet(FieldSet fieldSet) throws BindException {

		String name = fieldSet.readString(NAME);
		String id = fieldSet.readString(ID);
		String rank = fieldSet.readString(RANK);

		Pathogen pathogen = dashboardFactory.create(Pathogen.class);
		pathogen.setDisplayName(name);
		pathogen.setTaxonomyId(id);
		pathogen.setRank(rank);

		for (String synonymName : fieldSet.readString(BROAD_SYNONYM).split("\\|")) {
			Synonym synonym = dashboardFactory.create(Synonym.class);
			synonym.setDisplayName(synonymName);
			pathogen.getSynonyms().add(synonym);
		}
		for (String synonymName : fieldSet.readString(EXACT_SYNONYM).split("\\|")) {
			Synonym synonym = dashboardFactory.create(Synonym.class);
			synonym.setDisplayName(synonymName);
			pathogen.getExactSynonyms().add(synonym);
		}
		for (String synonymName : fieldSet.readString(RELATED_SYNONYM).split("\\|")) {
			Synonym synonym = dashboardFactory.create(Synonym.class);
			synonym.setDisplayName(synonymName);
			pathogen.getRelatedSynonyms().add(synonym);
		}

		return pathogen;
	}
}
