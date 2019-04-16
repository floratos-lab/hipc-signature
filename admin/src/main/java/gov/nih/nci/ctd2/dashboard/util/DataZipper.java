package gov.nih.nci.ctd2.dashboard.util;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class DataZipper {
    private static final Log log = LogFactory.getLog(DataZipper.class);

    static private String SOURCE_DATA_LOCATION = "source_data/";
    static private String ZIP_FILE_TARGET_LOCATION = "web/src/main/webapp/data/submissions/";

    // zip up the source data supplied by Ken
    // it makes not much sense to zip the files read by the batch loading process
    // because they are in an intermediate format built out of the source data
    // according to aritfical/historical requirement
    public void createZip() {
        try {
            Files.list(new File(SOURCE_DATA_LOCATION).toPath()).forEach(path -> readOneDirectory(path));
        } catch (IOException e1) {
            e1.printStackTrace();
        }
    }

    private void createZip(String submissionName, String templateName) {
        try {
            FileOutputStream fileOutputStream = new FileOutputStream(
                    new File(ZIP_FILE_TARGET_LOCATION + submissionName + ".zip"));
            ZipOutputStream zipOutputStream = new ZipOutputStream(fileOutputStream);

            String filename = SOURCE_DATA_LOCATION + templateName + "/" + submissionName + ".txt";
            Path path = Paths.get(filename);
            zipOutputStream.putNextEntry(new ZipEntry(submissionName + ".txt"));
            zipOutputStream.write(Files.readAllBytes(path));
            zipOutputStream.closeEntry();
            String summary = SOURCE_DATA_LOCATION + templateName + "/" + templateName + "-CV-per-template.txt";
            Path summaryPath = Paths.get(summary);
            zipOutputStream.putNextEntry(new ZipEntry(templateName + "-CV-per-template.txt"));
            zipOutputStream.write(Files.readAllBytes(summaryPath));
            zipOutputStream.closeEntry();

            zipOutputStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        log.debug(submissionName + " zipped");
    }

    private void readOneDirectory(Path path) {
        try {
            String templateName = path.toFile().getName();
            Files.list(path).forEach(file -> {
                String filename = file.toFile().getName();
                if (filename.endsWith("-CV-per-template.txt")) {
                    return; // skip the summary file, which is not a submission
                }
                String submissionName = filename.substring(0, filename.indexOf("."));
                createZip(submissionName, templateName);
            });
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}