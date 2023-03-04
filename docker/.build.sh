#!/bin/bash -x

cp ~/git/hipc-signature/web/target/hipc-dashboard-spring-boot.war .
cp ~/git/hipc-signature/hipc.sql ./dashboard.sql

docker build -t zhouji2018/hipc .
