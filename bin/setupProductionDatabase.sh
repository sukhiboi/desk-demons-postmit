#! /bin/bash

mkdir -p database 
databasePath=./database/postmitDatabase.db
./bin/createDatabaseTables.sh $databasePath