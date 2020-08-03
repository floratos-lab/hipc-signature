#!/bin/bash -x

if [ ! -z $1 ]; then
  docker tag zhouji2018/hipc zhouji2018/hipc:$1
  docker push zhouji2018/hipc:$1
else
  docker push zhouji2018/hipc
fi
