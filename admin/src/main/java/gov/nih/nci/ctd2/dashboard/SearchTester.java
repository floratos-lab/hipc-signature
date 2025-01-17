package gov.nih.nci.ctd2.dashboard;

import java.util.ArrayList;
import java.util.Date;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.transaction.annotation.Transactional;

import gov.nih.nci.ctd2.dashboard.dao.DashboardDao;
import gov.nih.nci.ctd2.dashboard.util.SearchResults;

/* 
    A simple tool to test searching functionality outside the web application. 
    Usage on Windows: java -cp admin\target\dashboard-admin.jar gov.nih.nci.ctd2.dashboard.SearchTester brisbane
    or Linux: java -cp admin/target/dashboard-admin.jar gov.nih.nci.ctd2.dashboard.SearchTester brisbane
    Note: brisbane is an example term to search for.
*/
public class SearchTester {
    private static final Log log = LogFactory.getLog(SearchTester.class);

    private static final ClassPathXmlApplicationContext appContext = new ClassPathXmlApplicationContext(
            "classpath*:META-INF/spring/applicationContext.xml", // This is for DAO/Dashboard Model

            /* the following must be included just to make it compilable */
            "classpath*:META-INF/spring/cellLineDataApplicationContext.xml",
            "classpath*:META-INF/spring/compoundDataApplicationContext.xml",
            "classpath*:META-INF/spring/TRCshRNADataApplicationContext.xml",
            "classpath*:META-INF/spring/tissueSampleDataApplicationContext.xml",
            "classpath*:META-INF/spring/controlledVocabularyApplicationContext.xml",
            "classpath*:META-INF/spring/observationDataApplicationContext.xml");

    @Transactional
    public static void main(String[] args) {

        DashboardDao dao = (DashboardDao) appContext.getBean("dashboardDao");
        log.debug("starting time " + new Date());
        SearchResults searchResults = dao.search(args[0]);
        log.debug("finished time " + new Date());
        System.out.println("returned number of subjects is " + searchResults.numberOfSubjects());
        searchResults.subject_result.stream().limit(10).forEach(x -> {
            System.out.println(x.id + "," + x.subjectName + ","
                    + x.className);
        });
        log.debug("done with testing " + new Date());
    }

}
