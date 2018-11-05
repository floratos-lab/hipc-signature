import os


class DataConfig:
    APP_LOCATION = ''
    ids = []

    def __init__(self, app_location, ids):
        self.APP_LOCATION = app_location
        self.ids = ids

    def save(self):
        f = open(os.path.join(self.APP_LOCATION,
                              "admin\\src\\main\\resources\\META-INF\\spring\\observationDataApplicationContext.xml.tmp"), 'w')
        f.write('''
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:batch="http://www.springframework.org/schema/batch"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/batch http://www.springframework.org/schema/batch/spring-batch-3.0.xsd
                           http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-3.1.xsd
                           http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.2.xsd">

    <import resource="classpath*:META-INF/spring/observationDataSharedApplicationContext.xml" />
    <context:component-scan base-package="gov.nih.nci.ctd2.dashboard.importer.internal" />
''')

        for item in self.ids:
            partialId = item[0]
            dataLocation = item[1]
            f.write('\n\t<bean name="'+partialId +
                    'Reader" class="org.springframework.batch.item.file.MultiResourceItemReader">\n')
            f.write(
                '\t\t<property name="resources" value="${'+dataLocation+'}" />')

            f.write('''
            <property name="delegate">
                <bean class="org.springframework.batch.item.file.FlatFileItemReader">
    ''')
            f.write('\t\t\t\t<property name="lineMapper" ref="' +
                    partialId+'LineMapper" />\n')
            f.write('\t\t\t\t<property name="linesToSkip" value="7" />\n')
            f.write('\n\t\t\t</bean>')
            f.write('\n\t\t</property>')
            f.write('\n\t</bean>')

        f.write('\n\n</beans>')
        f.close()
