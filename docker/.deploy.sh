#!/bin/bash -x

# to deploy to cloud, the image must be in hub (not locally)

version=latest
if [ ! -z $1 ]; then
  version=$1
fi

vm_name=hipc-stage
static_ip= #35.237.66.108

gcloud compute instances delete ${vm_name} --project=hipc-project
gcloud compute instances create-with-container ${vm_name} --container-env=MYSQL_ROOT_PASSWORD=${DB_PASSWORD} --container-image=zhouji2018/hipc:$version \
 --container-mount-host-path mount-path=/index-base/hipc-signatures-index,host-path=${HOME}/hipc-signatures-index \
 --container-mount-host-path mount-path=/var/lib/mysql,host-path=${HOME}/datadir \
 --container-privileged --tags=http-server,https-server --project=hipc-project --zone=us-east1-b --boot-disk-size=20GB --address=${static_ip} \
 --container-command "tail" --container-arg="-f" --container-arg="/dev/null"

gcloud compute scp /index-base/hipc-signatures-index ${vm_name}:~/hipc-signatures-index --scp-flag=-r --project=hipc-project
gcloud compute scp ~/mysql/datadir ${vm_name}:~/. --scp-flag=-r --project=hipc-project
