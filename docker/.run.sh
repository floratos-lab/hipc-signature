#!/bin/bash -x
# run the image locally for testing

docker container stop hipc
docker container rm hipc
if [ ! -z $1 ]; then
  docker run -d --name hipc -p 9002:80 zhouji2018/hipc:$1
else
  docker run -d --name hipc -p 9002:80 zhouji2018/hipc
fi
