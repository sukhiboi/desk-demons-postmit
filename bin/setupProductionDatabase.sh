#! /bin/bash

mkdir -p database;

sqlite3 ./database/postmitDatabase.db <<'END_SQL'
CREATE TABLE IF NOT EXISTS users (
	username VARCHAR(39) PRIMARY KEY,
	github_username VARCHAR(39) UNIQUE NOT NULL,
	name VARCHAR(100),
	bio VARCHAR(200),
	dob DATE,
	joined_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
	id NUMBER primary key,
	username VARCHAR(39),
	message VARCHAR(180) NOT NULL,
	posted_at datetime NOT NULL
);

CREATE TABLE IF NOT EXISTS responses (
	post_id NUMBER NOT NULL,
	response_id NUMBER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS likes (
	post_id NUMBER NOT NULL,
	username VARCHAR(39) NOT NULL
);

CREATE TABLE IF NOT EXISTS reposts (
	post_id NUMBER NOT NULL,
	username VARCHAR(39) NOT NULL
);

CREATE TABLE IF NOT EXISTS bookmarks (
	post_id NUMBER NOT NULL,
	username VARCHAR(39) NOT NULL
);

CREATE TABLE IF NOT EXISTS followers (
	username VARCHAR(39) NOT NULL,
	follower VARCHAR(39) NOT NULL
);

CREATE TABLE IF NOT EXISTS hashtags (
	post_id NUMBER NOT NULL,
	hashtag VARCHAR(10) NOT NULL
);
END_SQL
