#!/bin/sh -x
mvn clean package -Ddatabase.username=root -Ddatabase.password=$DB_PASSWORD\
 -Ddatabase.url="jdbc:mysql://127.0.0.1:3306/hipc_signature?serverTimezone=America/New_York"\
 -Ddatabase.test.url="jdbc:mysql://127.0.0.1:3306/hipc_test?serverTimezone=America/New_York"\
 -Ddatabase.test.clean.skip=true\
 -Ddashboard.release.version=`date +%Y.%m.%d`