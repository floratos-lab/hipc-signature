#!/bin/sh -x

cd web/src/main/webapp && npx webpack && cd -

# -DskipTests compiles the tests, but skips running them
# -Dmaven.test.skip=true skips compiling the tests and does not run them
# see http://maven.apache.org/surefire/maven-surefire-plugin/examples/skipping-tests.html

mvn clean package -Ddatabase.username=root -Ddatabase.password=$DB_PASSWORD\
 -Ddatabase.url="jdbc:mysql://127.0.0.1:3306/hipc?serverTimezone=America/New_York"\
 -Ddatabase.test.url="jdbc:mysql://127.0.0.1:3306/hipc_test?serverTimezone=America/New_York"\
 -Ddatabase.test.clean.skip=true\
 -Ddashboard.release.version="v1.5.0 (`date +%Y.%m.%d`)" #`date +%Y.%m.%d`
