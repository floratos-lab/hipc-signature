#!/bin/bash -x

# to deploy to cloud, the image must be in hub (not locally)

version=latest
if [ ! -z $1 ]; then
  version=$1
fi

gcloud compute instances delete hipc --project=hipc-project
gcloud compute instances create-with-container hipc --container-image=zhouji2018/hipc:$version --container-privileged --tags=http-server,https-server --project=hipc-project --zone=us-east1-b --address=35.237.66.108
