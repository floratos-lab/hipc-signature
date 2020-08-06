#!/bin/bash -x

if [ -z $INDEX_BASE ]; then export INDEX_BASE=~/index-base; fi

cp ~/git/hipc-signature/web/target/hipc-signature-spring-boot.war .
rm -r ./hipc-signatures-index/*
cp -r ${INDEX_BASE}/hipc-signatures-index .

docker build -t zhouji2018/hipc .
