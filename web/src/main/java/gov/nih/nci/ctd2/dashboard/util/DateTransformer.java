package gov.nih.nci.ctd2.dashboard.util;

import flexjson.transformer.AbstractTransformer;

import java.text.SimpleDateFormat;
import java.util.Date;

/* The only field of Date type in all data models is 'submission date', which will have only year and month from now on.
When there are other fields of Date type, we may need to use a different transformer for the desired format. */
public class DateTransformer extends AbstractTransformer {
    @Override
    public void transform(Object object) {
        assert object instanceof Date;
        Date date = (Date) object;
        SimpleDateFormat dateFormat = new SimpleDateFormat("MMM, 20yy");
        getContext().writeQuoted(dateFormat.format(date));
    }
}
