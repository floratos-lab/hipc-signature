package gov.nih.nci.ctd2.dashboard.dao;

import gov.nih.nci.ctd2.dashboard.model.*;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import static org.junit.Assert.*;

public class SynonymSearchTest {
    private ConfigurableApplicationContext appContext;
    private DashboardDao dashboardDao;
    private DashboardFactory dashboardFactory;

    @Before
    public void initiateDao() {
        appContext = new ClassPathXmlApplicationContext("classpath*:META-INF/spring/testApplicationContext.xml");
        this.dashboardDao = (DashboardDao) appContext.getBean("dashboardDao");
        this.dashboardFactory = (DashboardFactory) appContext.getBean("dashboardFactory");
    }

    @After
    public void closeContext() {
        appContext.close();
    }

    @Test
    public void searchSynonymTest() {
        //String test = "synonym-001";
        String test = "SYnonym-001";
        Synonym synonym = dashboardFactory.create(Synonym.class);
        synonym.setDisplayName(test);
        String test2 = "SYnonym-002";
        Synonym synonym2 = dashboardFactory.create(Synonym.class);
        synonym2.setDisplayName(test2);

        Pathogen pathogen = dashboardFactory.create(Pathogen.class);
        pathogen.setDisplayName("pathogen-001");
        pathogen.getSynonyms().add(synonym);
        //pathogen.getSynonyms().add(synonym2);
        // we must clean up the index as following before each test session
        //  sudo rm -rf /index-base/hipc-signatures-index-test/*
        // otherwise the result could be misleading
        pathogen.getExactSynonyms().add(synonym2);
        dashboardDao.save(pathogen);

        assertTrue("search non-existent words", dashboardDao.search("something").isEmpty());

        String lowercase = test.toLowerCase();
        //assertEquals("search "+test+"*", 1, dashboardDao.search(test+"*").numberOfSubjects());
        assertEquals("search "+test, 0, dashboardDao.search(test).numberOfSubjects());
        // original cases cannot be found. only lower case can be found
        assertEquals("search "+lowercase, 1, dashboardDao.search(lowercase).numberOfSubjects());
        String lowercase2 = test2.toLowerCase();
        assertEquals("search "+lowercase2, 1, dashboardDao.search(lowercase2).numberOfSubjects());
    }
}
