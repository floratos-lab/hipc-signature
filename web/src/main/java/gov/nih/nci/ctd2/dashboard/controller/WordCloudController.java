package gov.nih.nci.ctd2.dashboard.controller;

import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import flexjson.JSONSerializer;
import gov.nih.nci.ctd2.dashboard.dao.DashboardDao;
import gov.nih.nci.ctd2.dashboard.util.WordCloudEntry;

@Controller
@RequestMapping("/wordcloud")
public class WordCloudController {
    private static final Log log = LogFactory.getLog(WordCloudController.class);
    @Autowired
    private DashboardDao dashboardDao;

    @Transactional
    @RequestMapping(value = "{wordcloud_id}", method = { RequestMethod.GET }, headers = "Accept=application/json")
    public ResponseEntity<String> getSubjectCountsForRoles(@PathVariable String wordcloud_id) {
        log.debug("request received for wordcloud_id: " + wordcloud_id);
        Map<String, String> map = Map.of("all", "", "genes", "genes", "celltypes", "cell_biomarker", "vaccines", "vaccine", "pathogens", "pathogen", "tissues", "tissue");
        String role = map.get(wordcloud_id);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        WordCloudEntry[] words = dashboardDao.getSubjectCountsForRole(role);

        JSONSerializer jsonSerializer = new JSONSerializer().exclude("class");
        String json = "{}";
        try {
            json = jsonSerializer.deepSerialize(words);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<String>(headers, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<String>(json, headers, HttpStatus.OK);
    }

    @Transactional
    @RequestMapping(value = "subject/{subject_id}", method = { RequestMethod.GET }, headers = "Accept=application/json")
    public ResponseEntity<String> getCountsForSubject(@PathVariable Integer subject_id) {
        log.debug("request received for subject id: " + subject_id);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        WordCloudEntry[] words = dashboardDao.getSubjectCounts(subject_id);

        JSONSerializer jsonSerializer = new JSONSerializer().exclude("class");
        String json = "{}";
        try {
            json = jsonSerializer.deepSerialize(words);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<String>(headers, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<String>(json, headers, HttpStatus.OK);
    }
}
