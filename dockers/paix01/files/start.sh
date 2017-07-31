#!/bin/bash
cd ${IFROOT}/penn-ai
#results already in the db?
if [ -f "mongo_export.log" ]
then
        echo "mongo_export.log found."
else
        python3 /opt/penn-ai/tests/export_to_mongo.py > mongo_export.log
fi
if [ -f "rec_state.obj" ]
then
        rm -f rec_state.obj
fi
#start the ai
python3 -m ai.ai
bash
