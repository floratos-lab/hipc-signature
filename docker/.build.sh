#!/bin/bash -x

cp ~/git/hipc-signature/web/target/hipc-dashboard-spring-boot.war .
docker build -t zhouji2018/hipc .
