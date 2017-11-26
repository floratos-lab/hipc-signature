#!/bin/bash
# rebuild and deploy the project to local tomcat

[ -v $CATALINA_HOME ] && CATALINA_HOME=~/apache-tomcat-8.5.11
[ -v $HIPC_DATA_HOME ] && HIPC_DATA_HOME=~/data_collection/hipc_data
echo CATALINA_HOME is $CATALINA_HOME
echo HIPC_DATA_HOME is $HIPC_DATA_HOME

mvn clean
if [ ! $? -eq 0 ]; then
    echo something went wrong in cleaning
    exit 1
fi
mvn package
if [ ! $? -eq 0 ]; then
    echo something went wrong
    exit 1
fi
$CATALINA_HOME/bin/shutdown.sh
rmd -rf $CATALINA_HOME/webapps/hipc-signature
cp ./web/target/hipc-signature.war $CATALINA_HOME/webapps
$CATALINA_HOME/bin/startup.sh
