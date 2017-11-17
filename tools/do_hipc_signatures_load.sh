#!/bin/bash
# the main script to load the data into ctd2-dashboard system

if [ -z $HIPC_HOME ]; then HIPC_HOME=..; fi
if [ -z $HIPC_DATA_HOME ]; then export HIPC_DATA_HOME=C:/tmp/hipc_data; fi

echo "checking enrivonment ..."
echo $HIPC_DATA_HOME
echo "done"

LOAD_OPTS=('t' 'am' 'cl' 'ts' 'cp' 'g' 'p' 'sh' 'si' 'cv' 'o' 'i' 'r')
for opt in "${LOAD_OPTS[@]}"
do
    CMD="time java $JAVA_OPTS -jar $HIPC_HOME/admin/target/dashboard-admin.jar -$opt"
    echo $CMD
    bash -c "$CMD"
    if [[ $? -ne 0 ]] ; then
        echo 'Failed'
        exit 1
    fi
done
exit 0
