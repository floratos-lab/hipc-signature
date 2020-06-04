#!/bin/sh -x
# deploy to local tomcat

if [ -z "$CATALINA_HOME" ]; then CATALINA_HOME=/home/zhouji/apache-tomcat-8.5.50; fi
cp ./web/target/hipc-signature.war $CATALINA_HOME/webapps
tail -f $CATALINA_HOME/logs/catalina.out