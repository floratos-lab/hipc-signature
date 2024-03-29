#!/bin/bash -x
# load background and submission data. doing them separately will mess up the index.

if [ -z $HIPC_DATA_HOME ]; then export HIPC_DATA_HOME=~/data_collection/hipc_data; fi
if [ -z $HIPC_HOME ]; then export HIPC_HOME=~/git/hipc-signature; fi

MYSQL_IP=127.0.0.1
mysql -uroot -p$DB_PASSWORD --host=${MYSQL_IP} --port=3306 -e "DROP DATABASE IF EXISTS hipc"
mysql -uroot -p$DB_PASSWORD --host=${MYSQL_IP} --port=3306 -e "CREATE DATABASE hipc"

LOAD_OPTS=('t' 'am' 'cl' 'ts' 'cp' 'g' 'p' 'sh' 'si' 'v' 'c' 'n' 'cv' 'o' 'i' 'r')
for opt in "${LOAD_OPTS[@]}"
do
    CMD="java -jar $HIPC_HOME/admin/target/dashboard-admin.jar -$opt"
    echo $CMD
    $CMD
    if [[ $? -ne 0 ]] ; then
        echo 'Failed'
        exit 1
    fi
done

mysqldump -uroot -p$DB_PASSWORD --host=${MYSQL_IP} --port=3306 --databases hipc > hipc.sql
exit 0
