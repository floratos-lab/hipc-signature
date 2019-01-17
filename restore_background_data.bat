rem restore the background data
IF NOT DEFINED HIPC_DATA_HOME SET HIPC_DATA_HOME=C:\data_collection\hipc_data

echo starting %time%
mysql -u root -p%DB_PASSWORD% < tools\reset_database.sql
mysql -u root -p%DB_PASSWORD% hipc_signature < hipc_signature_background.sql
echo background data restored %time%
