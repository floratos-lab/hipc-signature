rem load the background data

IF NOT DEFINED HIPC_DATA_HOME SET HIPC_DATA_HOME=C:\data_collection\hipc_data

echo start time %time%

mysql -u root -p < tools\reset_database.sql

java -jar admin\target\dashboard-admin.jar -t
java -jar admin\target\dashboard-admin.jar -am
echo starting cell line %time%
java -jar admin\target\dashboard-admin.jar -cl
echo starting tissue sample %time%
java -jar admin\target\dashboard-admin.jar -ts
java -jar admin\target\dashboard-admin.jar -cp
echo starting gene %time%
java -jar admin\target\dashboard-admin.jar -g
echo starting protein %time%
java -jar admin\target\dashboard-admin.jar -p
echo starting shRNA %time%
java -jar admin\target\dashboard-admin.jar -sh
java -jar admin\target\dashboard-admin.jar -si

echo starting vaccine %time%
java -jar admin\target\dashboard-admin.jar -v
echo starting cell subset %time%
java -jar admin\target\dashboard-admin.jar -c
echo starting pathogen %time%
java -jar admin\target\dashboard-admin.jar -n
echo finished %time%

echo end time %time%
