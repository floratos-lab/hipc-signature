#!/bin/bash -x
# run the image locally for testing

docker container stop hipc
docker container rm hipc

image_name=zhouji2018/hipc
if [ ! -z $1 ]; then
  image_name=zhouji2018/hipc:$1
fi
docker run -v /index-base/hipc-signatures-index:/index-base/hipc-signatures-index -e MYSQL_ROOT_PASSWORD=${DB_PASSWORD} -d --name hipc -p 9002:80 ${image_name}
