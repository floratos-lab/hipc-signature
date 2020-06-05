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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import flexjson.JSONSerializer;
import gov.nih.nci.ctd2.dashboard.dao.DashboardDao;
import gov.nih.nci.ctd2.dashboard.util.GeneData;

@Controller
@RequestMapping("/gene-data")
public class GenesController {
    private static Log log = LogFactory.getLog(GenesController.class);

    @Autowired
    private DashboardDao dashboardDao;

    private final int COLUMN_NUMBER = 3;
    private int recordsTotal, recordsFiltered;

    private String orderBy = "numberofObservations";
    private String direction = "DESC";

    /* for parameters detail, see https://datatables.net/manual/server-side */
    @Transactional
    @RequestMapping(method = { RequestMethod.POST, RequestMethod.GET }, headers = "Accept=application/json")
    public ResponseEntity<String> getTableData(@RequestParam Map<String, String> params) {
        log.debug("request received in gene-data controller");
        recordsTotal = dashboardDao.getGeneNumber();
        recordsFiltered = recordsTotal;
        int draw = 0, start = 0, length = 0, order = 0;
        String newDirection = direction;
        for (String x : params.keySet()) {
            System.out.println(x + "=" + params.get(x));
            switch (x) {
                case "draw":
                    draw = Integer.parseInt(params.get(x));
                    break;
                case "start":
                    start = Integer.parseInt(params.get(x));
                    break;
                case "length":
                    length = Integer.parseInt(params.get(x));
                    break;
                case "order[0][column]":
                    order = Integer.parseInt(params.get(x));
                    break;
                case "order[0][dir]":
                    newDirection = params.get(x);
                    break;
            }
        }
        log.debug("draw is " + draw);
        log.debug("start is " + start);
        log.debug("lenght is " + length);
        if (order == 1) {
            orderBy = "displayName";
            direction = newDirection;
        } else if (order == 3) {
            orderBy = "numberofObservations";
            direction = newDirection;
        }
        GeneData[] g = dashboardDao.getGeneData(start, length, orderBy, direction);
        length = g.length; // actual length
        String[][] data = new String[length][COLUMN_NUMBER];
        for (int i = 0; i < length; i++) {
            GeneData geneData = g[i];
            data[i][0] = geneData.symbol;
            data[i][1] = String.valueOf(geneData.numberOfObservations);
            data[i][2] = geneData.url;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        JSONSerializer jsonSerializer = new JSONSerializer().include("data");

        Response x = new Response(draw, data);
        try {
            ResponseEntity<String> r = new ResponseEntity<String>(jsonSerializer.serialize(x), headers, HttpStatus.OK);
            log.debug(r);
            return r;
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<String>("{\"error\":dataTables server-side error:" + e + "}", headers,
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public class Response {
        public Response(int draw, final String[][] data) {
            this.draw = draw;
            this.recordsTotal = GenesController.this.recordsTotal;
            this.recordsFiltered = GenesController.this.recordsFiltered;
            this.data = data;
        }

        final private int draw, recordsTotal, recordsFiltered;
        final private String[][] data;

        public int getDraw() {
            return draw;
        }

        public int getRecordsTotal() {
            return recordsTotal;
        }

        public int getRecordsFiltered() {
            return recordsFiltered;
        }

        public String[][] getData() {
            return data;
        }
    }
}
