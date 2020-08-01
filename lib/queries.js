const queries = {
  userDetails: 'SELECT * FROM users WHERE userId=?',
  userPosts: 'SELECT * FROM posts WHERE userId=? ORDER BY postedAt DESC',
  following: 'SELECT followerId as userId FROM followers WHERE userId=?',
  postLikers: 'SELECT userId FROM likes WHERE postId=?',
  savePost:
    "INSERT INTO posts(postId, userId, message, postedAt) VALUES(?, ?, ?, datetime('now','localtime'));",
  likePost: 'INSERT INTO likes VALUES (?,?)',
  unlikePost: 'DELETE FROM likes WHERE postId=? AND userId=?',
  removePost: function (postId) {
    return `BEGIN TRANSACTION; DELETE FROM posts WHERE postId=${postId}; DELETE FROM likes WHERE postId=${postId}; COMMIT TRANSACTION`;
  },
  idByUsername: 'SELECT userId FROM users WHERE username=?',
  followUser: 'INSERT INTO followers VALUES (?,?)',
  unFollowUser: 'DELETE FROM followers WHERE userId=? and followerId=?',
  followers: 'SELECT userId FROM followers WHERE followerId=?',
  saveUser:
    "INSERT INTO users(username, githubUsername, name, bio, dob, joinedDate) VALUES(?, ?, ?, ?, ?, date('now')) ",
  likedPosts:
    'SELECT t1.postId,t1.userId,t1.message,t1.postedAt FROM posts t1 JOIN likes t2 ON t1.postId=t2.postId WHERE t2.userId=? ORDER BY t1.postedAt DESC',
  matchingUsers:
    'SELECT name,username from users where name like ? or username like ?;',
  idByGithubUsername: 'SELECT userId FROM users WHERE githubUsername=?',
  post: 'SELECT * FROM posts WHERE postId=?',
  hashtags: 'SELECT hashtag FROM hashtags where postId=?',
  bookmarks:
    'SELECT t2.postId,t2.userId,t2.message,t2.postedAt FROM bookmarks t1 JOIN posts t2 ON t1.postId=t2.postId WHERE t1.userId=? ORDER BY t2.postedAt DESC',
  postsByHashtag:
    'SELECT t1.postId,t1.userId,t1.message,t1.postedAt FROM posts t1 JOIN hashtags t2 ON t1.postId=t2.postId WHERE t2.hashtag=? ORDER BY t1.postedAt DESC',
  addHashtag: 'INSERT INTO hashtags VALUES(?,?);',
  addBookmark: 'INSERT INTO bookmarks VALUES(?,?);',
  removeBookmark: 'DELETE FROM bookmarks WHERE postId=? AND userId=?;',
  matchingHashtags: 'SELECT hashtag from hashtags where hashtag like ?;',
  responses:
    'SELECT t2.responseId as postId, t1.message, t1.postedAt, t1.userId FROM posts t1 JOIN responses t2 ON t1.postId=t2.responseId WHERE t2.postId=? ORDER BY t1.postedAt DESC',
  addResponse: 'INSERT INTO responses VALUES(?,?);',
};

module.exports = queries;
