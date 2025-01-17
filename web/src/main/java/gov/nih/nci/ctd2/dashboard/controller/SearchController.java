package gov.nih.nci.ctd2.dashboard.controller;

import flexjson.JSONSerializer;
import gov.nih.nci.ctd2.dashboard.dao.DashboardDao;
import gov.nih.nci.ctd2.dashboard.util.DateTransformer;
import gov.nih.nci.ctd2.dashboard.util.ImplTransformer;
import gov.nih.nci.ctd2.dashboard.util.SearchResults;
import gov.nih.nci.ctd2.dashboard.util.SubjectResult;

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

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.nio.charset.Charset;
import java.util.Date;

@Controller
@RequestMapping("/search")
public class SearchController {
    private static final Log log = LogFactory.getLog(SearchController.class);

    @Autowired
    private DashboardDao dashboardDao;

    @Transactional
    @RequestMapping(value="{keyword}", method = {RequestMethod.GET, RequestMethod.POST}, headers = "Accept=application/json")
    public ResponseEntity<String> getSearchResultsInJson(@PathVariable String keyword) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        // Do not allow search with really genetic keywords
        // This is to prevent unnecessary server loads
        if(keyword.length() < 2)
            return new ResponseEntity<String>(headers, HttpStatus.BAD_REQUEST);
        try {
            keyword = URLDecoder.decode(keyword, Charset.defaultCharset().displayName());
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        SearchResults results = dashboardDao.search(keyword);

        if(log.isDebugEnabled()) {
            log.debug("keyword:"+keyword+":"+results.numberOfSubjects());
            for(SubjectResult r : results.subject_result) {
                log.debug(r.subjectName+"|"+r.className);
            }
        }

    JSONSerializer jsonSerializer = new JSONSerializer()
                .transform(new ImplTransformer(), Class.class)
                .transform(new DateTransformer(), Date.class);
        return new ResponseEntity<String>(
                jsonSerializer.deepSerialize(results),
                headers,
                HttpStatus.OK
        );
    }

}
