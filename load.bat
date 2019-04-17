rem load the data. hipc_signature database should be cleared out before doing this

IF NOT DEFINED HIPC_DATA_HOME SET HIPC_DATA_HOME=C:\data_collection\hipc_data

rem remove the index completely
SET INDEX_BASE=C:\index-base
rmdir /s %INDEX_BASE%\hipc-signatures-index\gov.nih.nci.ctd2.dashboard.impl.DashboardEntityImpl

mysql -u root -p%DB_PASSWORD% < tools\reset_database.sql

echo start loading background data %time%
java -Xmx1024m -jar admin\target\dashboard-admin.jar -t
java -Xmx1024m -jar admin\target\dashboard-admin.jar -am
java -Xmx1024m -jar admin\target\dashboard-admin.jar -cl
java -Xmx1024m -jar admin\target\dashboard-admin.jar -ts
java -Xmx1024m -jar admin\target\dashboard-admin.jar -cp
java -Xmx1024m -jar admin\target\dashboard-admin.jar -g
java -Xmx1024m -jar admin\target\dashboard-admin.jar -p
java -Xmx1024m -jar admin\target\dashboard-admin.jar -sh
java -Xmx1024m -jar admin\target\dashboard-admin.jar -si

echo start loading vaccine data %time%
java -Xmx1024m -jar admin\target\dashboard-admin.jar -v
echo start loading cell subset data %time%
java -Xmx1024m -jar admin\target\dashboard-admin.jar -c
echo start loading pathogen data %time%
java -Xmx1024m -jar admin\target\dashboard-admin.jar -n

echo start loading controlled vocabulary %time%
java -Xmx1024m -jar admin\target\dashboard-admin.jar -cv
echo start loading observation data %time%
java -Xmx1024m -jar admin\target\dashboard-admin.jar -o

echo start indexing %time%
java -Xmx1024m -jar admin\target\dashboard-admin.jar -i
echo start subject ranking %time%
java -Xmx1024m -jar admin\target\dashboard-admin.jar -r

echo all done %time%