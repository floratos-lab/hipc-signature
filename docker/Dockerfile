FROM openjdk:11.0.8-jre
LABEL maintainer="Zhou Ji <zhou.ji@yahoo.com>"

COPY hipc-signature-spring-boot.war app.war
COPY hipc-signatures-index/ /index-base/hipc-signatures-index

ENV INDEX_BASE=/index-base

EXPOSE 80

ENTRYPOINT ["java", "-jar", "/app.war", "--server.port=80"]