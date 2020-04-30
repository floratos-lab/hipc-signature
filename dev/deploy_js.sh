#!/bin/sh -x
# deploy js only to local tomcat

if [ -z "$CATALINA_HOME" ]; then CATALINA_HOME=~/apache-tomcat-8.5.50; fi
cp ./web/src/main/webapp/js/hipc-signature.js $CATALINA_HOME/webapps/hipc-signature/js/

