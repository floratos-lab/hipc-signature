rem import the background data and reload submission

IF NOT DEFINED HIPC_DATA_HOME SET HIPC_DATA_HOME=C:\data_collection\hipc_data

echo starting %time%

mysql -u root -p%DB_PASSWORD% < tools\reset_database.sql
mysql -u root -p%DB_PASSWORD% hipc_signature < hipc_signature_background.sql

call load_submission_data.bat

echo reloading submission data finished %time%

mysqldump -u root -p%DB_PASSWORD% --databases hipc_signature > hipc_signature.sql
