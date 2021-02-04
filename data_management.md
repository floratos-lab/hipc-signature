# data management

Update with new edition of data package is the most conspicious activity lately in this project.
This document describes the steps involved to handle such an update.

1. copy the data to the directory called `source_data`
2. update the matching gene background data
3. run the script called `raw_data_process.py` (under directory `tools`) to process the new data. This script both creates the proper data format required by the loading process and re-generates three relevant config files. *This may not be obvious: the loading config files depend on the source data, so this step must be done before rebuilding the application.*
   > like this `python3 tools/raw_data_process.py`
4. rebulid the application
   > like this `dev/build.sh`
5. load the data
   > like this `dev/reload.sh`
