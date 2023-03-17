#!/bin/bash -x

start=$SECONDS

if [ -z $HIPC_DATA_HOME ]; then export HIPC_DATA_HOME=~/data_collection/hipc_data; fi
if [ -z $HIPC_HOME ]; then export HIPC_HOME=~/git/hipc-signature; fi

mysql -uroot -p$DB_PASSWORD --host=127.0.0.1 --port=3306 -e "DROP DATABASE IF EXISTS hipc"
mysql -uroot -p$DB_PASSWORD --host=127.0.0.1 --port=3306 -e "CREATE DATABASE hipc"

sudo rm -rf $INDEX_BASE/hipc-signatures-index

LOAD_OPTS=('t' 'am' 'cl' 'ts' 'cp' 'g' 'p' 'sh' 'si' 'v' 'c' 'n' 'cv' 'o' 'i' 'r')
for opt in "${LOAD_OPTS[@]}"
do
    CMD="java -jar -Xmx16G $HIPC_HOME/admin/target/dashboard-admin.jar -$opt"
    echo $CMD
    $CMD
    if [[ $? -ne 0 ]] ; then
        echo 'Failed'
        exit 1
    fi
done

duration=$(( (SECONDS - start)/60 ))
echo total time $duration minutes

mysqldump -uroot -p$DB_PASSWORD --host=127.0.0.1 --port=3306 --databases hipc > hipc.sql

duration=$(( (SECONDS - start)/60 ))
echo after database dumping $duration minutes
