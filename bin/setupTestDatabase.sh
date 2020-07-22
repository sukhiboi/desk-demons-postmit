#! /bin/bash

mkdir -p test/database
databasePath=./test/database/testDatabase.db
./bin/createDatabaseTables.sh $databasePath

sqlite3 $databasePath <<'END_SQL'
.mode csv
.import "|tail -n +2 ./test/data/usersData.csv" users
.import "|tail -n +2 ./test/data/postsData.csv" posts
END_SQL