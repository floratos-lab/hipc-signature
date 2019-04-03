rem rebuild index files, which is the most time-consuming task

IF NOT DEFINED HIPC_DATA_HOME SET HIPC_DATA_HOME=C:\data_collection\hipc_data
rmdir /s C:\index-base\hipc-signatures-index\gov.nih.nci.ctd2.dashboard.impl.DashboardEntityImpl

set start=%time%
echo start time %start%

java -jar admin\target\dashboard-admin.jar -i

set end=%time%
echo end time %end%
