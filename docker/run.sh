#!/bin/bash

/usr/bin/mysqld_safe &

java -jar /app.war --server.port=80
