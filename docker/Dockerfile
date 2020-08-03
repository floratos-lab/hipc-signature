FROM openjdk:11-jdk
LABEL maintainer="Zhou Ji <zhou.ji@yahoo.com>"

ENV DEBIAN_FRONTEND noninteractive

ENV MYSQL_APT_PACKAGE=mysql-apt-config_0.8.13-1_all.deb

# Install mysql-server
RUN apt-get update && apt-get install -y lsb-release && \
  wget https://dev.mysql.com/get/$MYSQL_APT_PACKAGE && \
  dpkg -i $MYSQL_APT_PACKAGE && rm -f $MYSQL_APT_PACKAGE

RUN apt-get update && \
  apt-get -y install mysql-server pwgen supervisor && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Remove pre-installed database
RUN rm -rf /var/lib/mysql/*

# Add image configuration and scripts
COPY run.sh /run.sh
RUN chmod 755 /*.sh

COPY hipc-signature-spring-boot.war app.war
COPY dashboard.sql /dashboard.sql
COPY hipc-signatures-index/ /index-base/hipc-signatures-index

ENV INDEX_BASE=/index-base

EXPOSE 8080

ENTRYPOINT ["/run.sh"]