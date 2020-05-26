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
import gov.nih.nci.ctd2.dashboard.util.SubjectWithSummaries;

@Controller
@RequestMapping("/gene-data")
public class GenesController {
    private static Log log = LogFactory.getLog(GenesController.class);

    @Autowired
    private DashboardDao dashboardDao;

    private final int COLUMN_NUMBER = 4;
    private int recordsTotal, recordsFiltered;

    private void getTotal() {
        recordsTotal = dashboardDao.countEntities(SubjectWithSummaries.class).intValue(); // FIXME not the real number
                                                                                          // of genes
        recordsFiltered = recordsTotal;
    }

    /* for parameters detail, see https://datatables.net/manual/server-side */
    @Transactional
    @RequestMapping(method = { RequestMethod.POST, RequestMethod.GET }, headers = "Accept=application/json")
    public ResponseEntity<String> getTableData(@RequestParam Map<String, String> params) {
        log.debug("request received in gene-data controller");
        getTotal();
        int draw = 0, start = 0, length = 0;
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
            }
        }
        log.debug("draw is " + draw);
        log.debug("start is " + start);
        log.debug("lenght is " + length);
        String[][] data = new String[length][COLUMN_NUMBER];
        for (int i = 0; i < length; i++) {
            data[i][0] = "..gene logo..";
            data[i][1] = "<a>gene symbol " + (i + start) + "</a>";
            data[i][2] = "gene_biomarker";
            data[i][3] = "<a>number " + (i + start) + "</a>";
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
