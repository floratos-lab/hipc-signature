package gov.nih.nci.ctd2.dashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportResource;

@SpringBootApplication
@ImportResource({ "META-INF/spring/applicationContext.xml", "context.xml" })
public class HIPCDashboard {

    public static void main(String[] args) {
        SpringApplication.run(HIPCDashboard.class, args);
    }
}
