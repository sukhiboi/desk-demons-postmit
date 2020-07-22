#! /bin/bash

mkdir -p test/database;

sqlite3 ./test/database/testDatabase.db <<'END_SQL'
DROP TABLE IF EXISTS users;
CREATE TABLE users (
	username VARCHAR(39) PRIMARY KEY,
	github_username VARCHAR(39) UNIQUE NOT NULL,
	name VARCHAR(100),
	bio VARCHAR(200),
	dob DATE,
	joined_date DATE NOT NULL
);

DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
	id NUMBER primary key,
	username VARCHAR(39),
	message VARCHAR(180) NOT NULL,
	posted_at datetime NOT NULL
);

DROP TABLE IF EXISTS responses;
CREATE TABLE responses (
	post_id NUMBER NOT NULL,
	response_id NUMBER PRIMARY KEY
);

DROP TABLE IF EXISTS likes;
CREATE TABLE likes (
	post_id NUMBER NOT NULL,
	username VARCHAR(39) NOT NULL
);

DROP TABLE IF EXISTS reposts;
CREATE TABLE reposts (
	post_id NUMBER NOT NULL,
	username VARCHAR(39) NOT NULL
);

DROP TABLE IF EXISTS bookmarks;
CREATE TABLE bookmarks (
	post_id NUMBER NOT NULL,
	username VARCHAR(39) NOT NULL
);

DROP TABLE IF EXISTS followers;
CREATE TABLE followers (
	username VARCHAR(39) NOT NULL,
	follower VARCHAR(39) NOT NULL
);

DROP TABLE IF EXISTS hashtags;
CREATE TABLE hashtags (
	post_id NUMBER NOT NULL,
	hashtag VARCHAR(10) NOT NULL
);

.mode csv
.import "|tail -n +2 ./test/data/usersData.csv" users
.import "|tail -n +2 ./test/data/postsData.csv" posts
END_SQL