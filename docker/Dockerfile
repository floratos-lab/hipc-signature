FROM openjdk:11.0.8-jre
LABEL maintainer="Zhou Ji <zhou.ji@yahoo.com>"

ENV DEBIAN_FRONTEND noninteractive

#ENV MYSQL_APT_PACKAGE=mysql-apt-config_0.8.13-1_all.deb
ENV MYSQL_APT_PACKAGE=mysql-apt-config_0.8.22-1_all.deb

# Install mysql-server
#RUN sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 467B942D3A79BD29
RUN apt-get update && apt-get install -y lsb-release && \
  wget https://dev.mysql.com/get/$MYSQL_APT_PACKAGE && \
  dpkg -i $MYSQL_APT_PACKAGE && rm -f $MYSQL_APT_PACKAGE

RUN apt-get update && \
  apt-get -y install mysql-server pwgen supervisor && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Add image configuration and scripts
COPY run.sh /run.sh
RUN chmod 755 /*.sh

COPY hipc-dashboard-spring-boot.war app.war

ENV INDEX_BASE=/index-base

EXPOSE 80

ENTRYPOINT ["/run.sh"]