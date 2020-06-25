package gov.nih.nci.ctd2.dashboard.controller;

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
    public ResponseEntity<String> getTableData(
            @RequestParam(value = "draw", required = false, defaultValue = "0") Integer draw,
            @RequestParam(value = "start", required = false, defaultValue = "0") Integer start,
            @RequestParam(value = "length", required = false, defaultValue = "0") Integer length,
            @RequestParam(value = "order[0][column]", required = false, defaultValue = "3") Integer order,
            @RequestParam(value = "order[0][dir]", required = false, defaultValue = "DESC") String newDirection,
            @RequestParam(value = "search[value]", required = false, defaultValue = "") String filterBy) {
        log.debug("request received in gene-data controller");
        recordsTotal = dashboardDao.getGeneNumber("");
        recordsFiltered = recordsTotal;
        if (order == 1) {
            orderBy = "displayName";
            direction = newDirection;
        } else if (order == 2) {
            orderBy = "numberofObservations";
            direction = newDirection;
        }
        if (filterBy.trim().length() > 0) {
            recordsFiltered = dashboardDao.getGeneNumber(filterBy.trim());
        }
        GeneData[] g = dashboardDao.getGeneData(start, length, orderBy, direction, filterBy.trim());
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

    @Transactional
    @RequestMapping(value = "all", method = { RequestMethod.GET,
            RequestMethod.POST }, headers = "Accept=application/json")
    public ResponseEntity<String> getWholeTableData(
            @RequestParam(value = "orderBy", required = false, defaultValue = "3") Integer order,
            @RequestParam(value = "direction", required = false, defaultValue = "desc") String direction,
            @RequestParam(value = "filterBy", required = false, defaultValue = "") String filterBy) {
        log.debug("request received for all gene-data");
        log.debug("orderBy " + orderBy + "; direction " + direction);
        if (order == 1) {
            orderBy = "displayName";
        } else if (order == 2) {
            orderBy = "numberofObservations";
        }
        if (filterBy == null)
            filterBy = "";
        filterBy = filterBy.trim();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");
        String[][] data = dashboardDao.getAllGeneData(orderBy, direction, filterBy);
        try {
            return new ResponseEntity<String>(new JSONSerializer().serialize(data), headers, HttpStatus.OK);
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
