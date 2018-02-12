rem rebuild index files, which is the most time-consuming task

set start=%time%
echo start time %start%

java -Xmx1024m -jar admin\target\dashboard-admin.jar -i

set end=%time%
echo end time %end%
