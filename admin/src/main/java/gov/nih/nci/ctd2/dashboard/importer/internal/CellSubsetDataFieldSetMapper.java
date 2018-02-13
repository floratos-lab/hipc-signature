package gov.nih.nci.ctd2.dashboard.importer.internal;

import gov.nih.nci.ctd2.dashboard.model.CellSubset;
import gov.nih.nci.ctd2.dashboard.model.DashboardFactory;
import gov.nih.nci.ctd2.dashboard.model.Synonym;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindException;
import org.springframework.batch.item.file.transform.FieldSet;
import org.springframework.batch.item.file.mapping.FieldSetMapper;
import org.springframework.beans.factory.annotation.Autowired;

@Component("cellSubsetDataMapper")
public class CellSubsetDataFieldSetMapper implements FieldSetMapper<CellSubset> {

	private static final String NAME = "name";
	private static final String	ID = "id";
	private static final String	DEFINITION = "definition";
	private static final String	COMMENT = "comment";
	private static final String	BROAD_SYNONYM = "broad";
	private static final String	EXACT_SYNONYM = "exact";
	private static final String	RELATED_SYNONYM = "related";

    @Autowired
    private DashboardFactory dashboardFactory;

	public CellSubset mapFieldSet(FieldSet fieldSet) throws BindException {

		String name = fieldSet.readString(NAME);
		String id = fieldSet.readString(ID);
		String definition = fieldSet.readString(DEFINITION);
		String comment = fieldSet.readString(COMMENT);

		CellSubset cellSubset = dashboardFactory.create(CellSubset.class);
		cellSubset.setDisplayName(name);
		cellSubset.setCellOntologyId(id);
		cellSubset.setDefinition(definition);
		cellSubset.setComment(comment);

		for (String synonymName : fieldSet.readString(BROAD_SYNONYM).split("\\|")) {
			Synonym synonym = dashboardFactory.create(Synonym.class);
			synonym.setDisplayName(synonymName);
			cellSubset.getSynonyms().add(synonym);
		}
		for (String synonymName : fieldSet.readString(EXACT_SYNONYM).split("\\|")) {
			Synonym synonym = dashboardFactory.create(Synonym.class);
			synonym.setDisplayName(synonymName);
			cellSubset.getExactSynonyms().add(synonym);
		}
		for (String synonymName : fieldSet.readString(RELATED_SYNONYM).split("\\|")) {
			Synonym synonym = dashboardFactory.create(Synonym.class);
			synonym.setDisplayName(synonymName);
			cellSubset.getRelatedSynonyms().add(synonym);
		}

		return cellSubset;
	}
}
