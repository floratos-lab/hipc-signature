#!/bin/bash

/usr/bin/mysqld_safe >> /mysql_starting_log.txt 2>&1 &

RET=1
while [[ RET -ne 0 ]]; do
    echo "=> Waiting for confirmation of MySQL service startup"
    sleep 5
    mysql -uroot -e "status" >> /mysql_starting_log.txt  2>&1
    RET=$?
done

mysql -uroot < /dashboard.sql > /loading_log.txt 2>&1
mysql -uroot -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';" > /setting_password_log.txt 2>&1

java -jar /app.war --server.port=80 >> /startup_log.txt 2>&1
