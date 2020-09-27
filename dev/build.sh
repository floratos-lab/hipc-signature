#!/bin/sh -x
mvn clean package -Ddatabase.username=root -Dtest.db.password=$DB_PASSWORD -Ddatabase.password=$X_PASSWORD\
 -Ddatabase.url="jdbc:mysql://35.222.69.75:3306/hipc_signature?serverTimezone=America/New_York"\
 -Ddatabase.test.url="jdbc:mysql://127.0.0.1:3306/hipc_test?serverTimezone=America/New_York"\
 -Ddatabase.test.clean.skip=true\
 -Ddashboard.release.version=`date +%Y.%m.%d`