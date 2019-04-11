package gov.nih.nci.ctd2.dashboard.controller;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import gov.nih.nci.ctd2.dashboard.dao.DashboardDao;

@Controller
@RequestMapping("/data")
public class DataController {
    @Autowired
    private DashboardDao dashboardDao;

    @Transactional
    @RequestMapping(value = "signature", method = { RequestMethod.GET })
    public void download(@RequestParam("submission") Integer id, HttpServletResponse response) {
        response.setContentType("text/plain");

        try {
            PrintWriter pw = new PrintWriter(response.getOutputStream());
            String[] signature = dashboardDao.getSignature();
            for (String s : signature) {
                pw.println(s);
            }
            pw.close();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
