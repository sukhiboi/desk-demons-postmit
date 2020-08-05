const select = function (table, field, selection) {
  return `SELECT ${selection} FROM ${table} WHERE ${field}=?`;
};

const insert = function (table) {
  return `INSERT INTO ${table} VALUES (?,?)`;
};

const queries = {
  select: select,
  insert: insert,
  userPosts: 'SELECT * FROM posts WHERE userId=? ORDER BY postedAt DESC',
  following: 'SELECT followerId as userId FROM followers WHERE userId=?',
  savePost:
    "INSERT INTO posts(postId, userId, message, postedAt) VALUES(?, ?, ?, datetime('now','localtime'));",
  unlikePost: 'DELETE FROM likes WHERE postId=? AND userId=?',
  removePost: function (postId) {
    return `BEGIN TRANSACTION; DELETE FROM posts WHERE postId=${postId}; DELETE FROM likes WHERE postId=${postId};DELETE FROM responses WHERE postId=${postId}; COMMIT TRANSACTION`;
  },
  unFollowUser: 'DELETE FROM followers WHERE userId=? and followerId=?',
  saveUser:
    "INSERT INTO users(username, githubUsername, name, bio, dob, joinedDate, imageUrl) VALUES(?, ?, ?, ?, ?, date('now'), ?) ",
  likedPosts:
    'SELECT t1.postId,t1.userId,t1.message,t1.postedAt FROM posts t1 JOIN likes t2 ON t1.postId=t2.postId WHERE t2.userId=? ORDER BY t1.postedAt DESC',
  matchingUsers:
    'SELECT name,username,imageUrl from users where name like ? or username like ?;',
  bookmarks:
    'SELECT t2.postId,t2.userId,t2.message,t2.postedAt FROM bookmarks t1 JOIN posts t2 ON t1.postId=t2.postId WHERE t1.userId=? ORDER BY t2.postedAt DESC',
  postsByHashtag:
    'SELECT t1.postId,t1.userId,t1.message,t1.postedAt FROM posts t1 JOIN hashtags t2 ON t1.postId=t2.postId WHERE t2.hashtag=? ORDER BY t1.postedAt DESC',
  removeBookmark: 'DELETE FROM bookmarks WHERE postId=? AND userId=?;',
  matchingHashtags:
    'SELECT DISTINCT hashtag from hashtags where hashtag like ?;',
  responses:
    'SELECT t2.responseId as postId, t1.message, t1.postedAt, t1.userId FROM posts t1 JOIN responses t2 ON t1.postId=t2.responseId WHERE t2.postId=? ORDER BY t1.postedAt DESC',
  replyingTo:
    'select users.username from users join posts on users.userId=posts.userId join responses on responses.postId=posts.postId where responses.responseId=?;',
  userResponses:
    'select t1.postId,t1.responseId from responses t1 join posts t2 on t1.responseId=t2.postId where t2.userId=? order by t2.postedAt DESC;',
  updateUser:
    'UPDATE users SET username=?, name=?, bio=?, dob=? WHERE userId=?',
};

module.exports = queries;
