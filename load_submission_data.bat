rem load the submission data. this should be done after loading the background data

IF NOT DEFINED HIPC_DATA_HOME SET HIPC_DATA_HOME=C:\data_collection\hipc_data

echo starting controlled vocabulary (background data) %time%
java -jar admin\target\dashboard-admin.jar -cv
echo starting submission data %time%
java -jar admin\target\dashboard-admin.jar -o

echo starting indexing %time%

java -jar admin\target\dashboard-admin.jar -i
java -jar admin\target\dashboard-admin.jar -r

echo end time %time%
