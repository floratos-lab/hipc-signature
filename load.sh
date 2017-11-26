#!/bin/bash
# load the data. hipc_signature database should be cleared out before doing this

[ -v $HIPC_DATA_HOME ] && export HIPC_DATA_HOME=~/data_collection/hipc_data

java -Xmx1024m -jar admin/target/dashboard-admin.jar -t
java -Xmx1024m -jar admin/target/dashboard-admin.jar -am
java -Xmx1024m -jar admin/target/dashboard-admin.jar -cl
java -Xmx1024m -jar admin/target/dashboard-admin.jar -ts
java -Xmx1024m -jar admin/target/dashboard-admin.jar -cp
java -Xmx1024m -jar admin/target/dashboard-admin.jar -g
java -Xmx1024m -jar admin/target/dashboard-admin.jar -p
java -Xmx1024m -jar admin/target/dashboard-admin.jar -sh
java -Xmx1024m -jar admin/target/dashboard-admin.jar -si

java -Xmx1024m -jar admin/target/dashboard-admin.jar -cv
java -Xmx1024m -jar admin/target/dashboard-admin.jar -o
java -Xmx1024m -jar admin/target/dashboard-admin.jar -i
java -Xmx1024m -jar admin/target/dashboard-admin.jar -r
