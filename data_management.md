# data management

Update with new edition of data package is the most conspicious activity lately in this project.
This document describes the steps involved to handle such an update.

1. copy the data to the directory called `source_data`
2. run the script called `raw_data_process.py` (under directory `tools`) to process the new data. This script both creates the proper data format required by the loading process and re-generates three relevant config files.
3. rebulid the application. deploy it either at this point (run `redeploy.bat` to do both tasks), or after data is loaded in step 4
4. reload the submission data by running `restore_background_data.bat` and then `load_submission_data.bat`
5. after verifying that the local deloyment works fine, deploy to the public instance on Google cloud
