#!/bin/bash -x

# to deploy to cloud, the image must be in hub (not locally)

version=latest
if [ ! -z $1 ]; then
  version=$1
fi

gcloud compute instances delete hipc-test --project=hipc-project
gcloud compute instances create-with-container hipc-test --container-env=MYSQL_ROOT_PASSWORD=${DB_PASSWORD} --container-image=zhouji2018/hipc:$version --container-privileged --tags=http-server,https-server --project=hipc-project --zone=us-east1-b --boot-disk-size=20GB 
