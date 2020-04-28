import os
import shutil


class DataConfig:
    APP_LOCATION = ''
    ids = []
    id2template_name = {}
    column_infos = {}

    def __init__(self, app_location, ids, id2template_name, column_infos):
        self.APP_LOCATION = app_location
        self.ids = ids
        self.id2template_name = id2template_name
        self.column_infos = column_infos

    def save(self):
        config_file = os.path.join(self.APP_LOCATION,
                                   "admin/src/main/resources/META-INF/spring/observationDataApplicationContext.xml")
        f = open(config_file+".tmp", 'w')

        f.write('''<?xml version="1.0" encoding="UTF-8"?>
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

        shutil.copy(config_file+".tmp", config_file)

    def saveSharedConfig(self):
        config_file = os.path.join(self.APP_LOCATION,
                                   "admin/src/main/resources/META-INF/spring/observationDataSharedApplicationContext.xml")
        f = open(config_file+".tmp", 'w')
        f.write('''<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		xmlns:batch="http://www.springframework.org/schema/batch"
		xmlns:context="http://www.springframework.org/schema/context"
        xsi:schemaLocation="http://www.springframework.org/schema/batch http://www.springframework.org/schema/batch/spring-batch-3.0.xsd
							http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-3.1.xsd
							http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.2.xsd">''')

        f.write('\n\t<batch:job id="observationDataImporterJob">')
        size = len(self.ids)
        for i in range(size):
            id = self.ids[i][0]
            if i == size-1:
                nextAttr = ''
            else:
                nextId = self.ids[i+1][0]
                nextAttr = 'next="'+nextId+'Step"'
            f.write(
                '\n\t\t<batch:step id="'+id+'Step" parent="observationDataStep" '+nextAttr+'>')
            f.write('\n\t\t\t<batch:tasklet>')
            f.write('\n\t\t\t\t<batch:chunk reader="'+id +
                    'Reader" processor="observationDataProcessor" writer="observationDataWriter"/>')
            f.write('\n\t\t\t</batch:tasklet>')
            f.write('\n\t\t</batch:step>')
        f.write('\n\t</batch:job>\n')

        f.write('''
    <bean id="observationDataStep" class="org.springframework.batch.core.step.item.SimpleStepFactoryBean" abstract="true">
        <property name="transactionManager" ref="transactionManager" />
        <property name="jobRepository" ref="jobRepository" />
        <property name="commitInterval" value="${spring.batch.commit.interval}" />
    </bean>
''')

        for i in range(size):
            id = self.ids[i][0]
            template_name = self.id2template_name[id]
            fields = 'dummy,submission_name,submission_date,template_name'
            for column_info in self.column_infos[template_name]:
                fields += ','+column_info[0]
            f.write('\n\t<bean name="'+id +
                    'LineMapper" class="org.springframework.batch.item.file.mapping.DefaultLineMapper">')
            f.write(
                '\n\t\t<property name="fieldSetMapper" ref="observationDataMapper" />')
            f.write('\n\t\t<property name="lineTokenizer" ref="' +
                    id+'LineTokenizer" />')
            f.write('\n\t</bean>')
            f.write('\n\t<bean name="'+id +
                    'LineTokenizer" class="org.springframework.batch.item.file.transform.DelimitedLineTokenizer" >')
            f.write('\n\t\t<property name="delimiter" value="&#9;"/>')
            f.write('\n\t\t<property name="names" value="'+fields+'"/>')
            f.write('\n\t</bean >\n')

        f.write('''
    <bean name="observationTemplateMap" class="java.util.HashMap">
        <constructor-arg index="0" type="java.util.Map">
            <map key-type="java.lang.String" value-type="java.lang.String">
''')
        for i in range(size):
            id = self.ids[i][0]
            template_name = self.id2template_name[id]
            for column_info in self.column_infos[template_name]:
                column_name = column_info[0]
                subject = column_info[1]
                evidence = column_info[2]
                role = column_info[3]
                mime_type = column_info[4]
                # two parts for subjects; three parts for evidence. delimited by :
                #subject_or_evidence = 'subject:'+subject if subject is not '' else 'evidence:'+evidence
                subject_or_evidence = create_method_name(
                    subject, evidence, role, mime_type)
                f.write('\n\t\t\t\t<entry key="'+template_name.strip('"')+':'+column_name +
                        '" value="'+subject_or_evidence+'" />')

            f.write('\n')  # leave empty after each submission
        f.write('''
            </map>
        </constructor-arg>
    </bean>''')

        f.write('\n</beans>')
        f.close()

        shutil.copy(config_file+".tmp", config_file)


def create_method_name(subject, evidence, role, mime_type):
    ''' create the name of the method used to import data by DAO '''

    if subject is not '':
        if subject == 'cell_subset':
            method_name = 'findCellSubsetByName'
        elif subject == 'pathogen':
            method_name = 'findPathogenByName'
        elif subject == 'vaccine':
            method_name = 'findVaccineByName'
        elif subject == 'gene':
            method_name = 'findGenesBySymbol'
        else:
            method_name = ''
            print("WARNING: unknown subject", subject)
        return 'subject:'+method_name
    else:
        if evidence == 'label':
            method_name = 'createObservedLabelEvidence'
        elif evidence == 'url':
            method_name = 'createObservedUrlEvidence'
        elif evidence == 'file':
            method_name = 'createObservedFileEvidence'
        else:
            method_name = ''
            print("WARNING: unknown evidence", evidence)
        return 'evidence:readString:'+method_name
