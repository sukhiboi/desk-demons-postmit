#!/bin/bash

if [ $1 == 'production' ]
then 
mkdir -p database 
databasePath=./database/postmitDatabase.db
fi

if [ $1 == 'test' ]
then 
rm -rf test/database
mkdir -p test/database 
databasePath=./test/database/testDatabase.db
fi

sqlite3 $databasePath <<'END_SQL'
CREATE TABLE IF NOT EXISTS users (
	user_id NUMERIC PRIMARY KEY,
	username VARCHAR(39) UNIQUE NOT NULL,
	github_username VARCHAR(39) UNIQUE NOT NULL,
	name VARCHAR(100),
	bio VARCHAR(200),
	dob DATE,
	joined_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
	id NUMBER primary key,
	user_id NUMERIC NOT NULL,
	message VARCHAR(180) NOT NULL,
	posted_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS responses (
	post_id NUMBER NOT NULL,
	response_id NUMBER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS likes (
	post_id NUMBER NOT NULL,
	user_id NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS reposts (
	post_id NUMBER NOT NULL,
	user_id NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS bookmarks (
	post_id NUMBER NOT NULL,
	user_id NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS followers (
	user_id NUMERIC NOT NULL,
	follower_id NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS hashtags (
	post_id NUMBER NOT NULL,
	hashtag VARCHAR(10) NOT NULL
);
.mode csv
.import "|tail -n +2 ./data/usersData.csv" users
.import "|tail -n +2 ./data/postsData.csv" posts
END_SQL