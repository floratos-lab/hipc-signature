package gov.nih.nci.ctd2.dashboard.util;

public class GeneData {
    final public String symbol;
    final public String url;
    final public int numberOfObservations;

    public GeneData(String symbol, String url, int numberOfObservations) {
        this.symbol = symbol;
        this.url = url;
        this.numberOfObservations = numberOfObservations;
    }
}