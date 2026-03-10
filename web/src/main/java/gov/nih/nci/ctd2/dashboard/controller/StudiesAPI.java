package gov.nih.nci.ctd2.dashboard.controller;

import java.util.Date;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import flexjson.JSONSerializer;
import gov.nih.nci.ctd2.dashboard.api.ExcludeTransformer;
import gov.nih.nci.ctd2.dashboard.api.SimpleDateTransformer;
import gov.nih.nci.ctd2.dashboard.dao.DashboardDao;
import gov.nih.nci.ctd2.dashboard.model.Submission;
import gov.nih.nci.ctd2.dashboard.util.ImplTransformer;
import gov.nih.nci.ctd2.dashboard.util.PMIDResult;

@Controller
@RequestMapping("/api/studies")
public class StudiesAPI {
    private static final Log log = LogFactory.getLog(StudiesAPI.class);
    @Autowired
    private DashboardDao dashboardDao;

    @Transactional
    @RequestMapping(method = { RequestMethod.GET }, headers = "Accept=application/json")
    public ResponseEntity<String> getCenters() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        List<PMIDResult> pmids = dashboardDao.getPMIDs();
        Study[] studies = new Study[pmids.size()];
        for (int i = 0; i < pmids.size(); i++) {
            PMIDResult result = pmids.get(i);
            List<Submission> submissions = dashboardDao.getSubmissionsPerPMID(result.pmid);
            String[] signatures = new String[submissions.size()];
            for (int j = 0; j < submissions.size(); j++) {
                signatures[j] = submissions.get(j).getStableURL();
            }
            studies[i] = new Study(result.description, result.pmid.toString(), result.publicationDate, signatures);
        }

        log.debug("ready to serialize");
        JSONSerializer jsonSerializer = new JSONSerializer().transform(new ImplTransformer(), Class.class)
                .transform(new SimpleDateTransformer(), Date.class).transform(new ExcludeTransformer(), void.class);
        String json = "{}";
        try {
            json = jsonSerializer.exclude("class").exclude("submissions.class").deepSerialize(studies);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<String>(headers, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<String>(json, headers, HttpStatus.OK);
    }

    public static class Study {
        public final String description, pmid;
        public Date publication_date;
        public final String[] signatures; // DashboardURI

        public Study(String description, String pmid, Date publication_date, String[] signatures) {
            this.description = description;
            this.pmid = pmid;
            this.publication_date = publication_date;
            this.signatures = signatures;
        }
    }
}
