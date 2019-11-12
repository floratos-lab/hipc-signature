rem rebuild and deploy the project to local tomcat

IF NOT DEFINED CATALINA_HOME SET CATALINA_HOME=C:\apache-tomcat-8.5.34
IF NOT DEFINED HIPC_DATA_HOME SET HIPC_DATA_HOME=C:\data_collection\hipc_data
echo CATALINA_HOME is %CATALINA_HOME%
echo HIPC_DATA_HOME is %HIPC_DATA_HOME%

set start=%time%

call mvn clean
if ERRORLEVEL 1 (
    echo something went wrong in cleaning
    exit /b 1
)
call mvn package
if ERRORLEVEL 1 (
    echo something went wrong
    exit /b 1
)

echo on

rmdir /s /q %CATALINA_HOME%\webapps\hipc-signature
copy .\web\target\hipc-signature.war %CATALINA_HOME%\webapps
call %CATALINA_HOME%\bin\startup.bat

set end=%time%
echo start time %start%
echo end time %end%
