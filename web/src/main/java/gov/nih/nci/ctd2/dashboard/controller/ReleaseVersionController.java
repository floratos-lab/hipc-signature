package gov.nih.nci.ctd2.dashboard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/release-version")
public class ReleaseVersionController {

    @Autowired
    private String dashboardReleaseVersion;

    @RequestMapping(method = { RequestMethod.GET })
    public ResponseEntity<String> getReleaseVersion() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "text/plain; charset=utf-8");
        return new ResponseEntity<String>(dashboardReleaseVersion, headers, HttpStatus.OK);
    }

}
