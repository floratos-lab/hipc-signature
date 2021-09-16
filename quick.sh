#!/bin/bash -x
# this script shows what need to be done when a new dataset from 'pipeline' is available
python3 tools/raw_data_process.py
sudo -E dev/build.sh
sudo -E dev/reload.sh
