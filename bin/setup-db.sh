#!/bin/bash

mkdir -p database 
databasePath=./database/postmitDatabase.db

sqlite3 $databasePath <<'END_SQL'
CREATE TABLE IF NOT EXISTS users (
	userId INTEGER PRIMARY KEY,
	username VARCHAR(15) UNIQUE NOT NULL,
	githubUsername VARCHAR(39) UNIQUE NOT NULL,
	name VARCHAR(50),
	bio VARCHAR(160),
	dob DATE,
	joinedDate DATE NOT NULL,
	imageUrl VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS posts (
	postId INTEGER PRIMARY KEY,
	userId INTEGER NOT NULL,
	message VARCHAR(180) NOT NULL,
	postedAt TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS responses (
	postId INTEGER NOT NULL,
	responseId INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS likes (
	postId INTEGER NOT NULL,
	userId INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reposts (
	postId INTEGER NOT NULL,
	userId INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bookmarks (
	postId INTEGER NOT NULL,
	userId INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS followers (
	userId INTEGER NOT NULL,
	followerId INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS hashtags (
	postId INTEGER NOT NULL,
	hashtag VARCHAR(20) NOT NULL
);
.mode csv
.separator '|'
.import "./data/usersData.csv" users	
.import "./data/postsData.csv" posts	
.import "./data/responsesData.csv" responses
.import "./data/likesData.csv" likes
.import "./data/repostsData.csv" reposts
.import "./data/bookmarksData.csv" bookmarks
.import "./data/followersData.csv" followers
.import "./data/hashtagsData.csv" hashtags
END_SQL
