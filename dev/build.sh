#!/bin/sh -x
CLOUD_DB_IP=35.222.69.75
mvn clean package -Ddatabase.username=root -Ddatabase.password=$CLOUD_DB_PASSWORD\
 -Dtest.database.password=$DB_PASSWORD\
 -Ddatabase.url="jdbc:mysql://${CLOUD_DB_IP}:3306/hipc_signature?serverTimezone=America/New_York"\
 -Ddatabase.test.url="jdbc:mysql://127.0.0.1:3306/hipc_test?serverTimezone=America/New_York"\
 -Ddatabase.test.clean.skip=true\
 -Ddashboard.release.version=`date +%Y.%m.%d`