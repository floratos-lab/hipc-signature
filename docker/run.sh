#!/bin/bash

mysqld --initialize-insecure --user=mysql > /mysql_starting_log.txt 2>&1
mkdir -p /var/run/mysqld
chown mysql:mysql /var/run/mysqld

/usr/bin/mysqld_safe >> /mysql_starting_log.txt 2>&1 &

RET=1
while [[ RET -ne 0 ]]; do
    echo "=> Waiting for confirmation of MySQL service startup"
    sleep 5
    mysql -uroot -e "status" >> /mysql_starting_log.txt  2>&1
    RET=$?
done

mysql -uroot < /dashboard.sql > /loading_log.txt 2>&1
mysql -uroot -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';" > /setting_password_log.txt 2>&1

mysqladmin -uroot shutdown

systemctl start mysql >> /startup_log.txt 2>&1
java -jar /app.war --server.port=80 >> /startup_log.txt 2>&1
