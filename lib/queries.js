const queries = {
  userDetails: 'SELECT * FROM users WHERE userId=?',
  userPosts: 'SELECT * FROM posts WHERE userId=? ORDER BY postedAt DESC',
  following: 'SELECT followerId as userId FROM followers WHERE userId=?',
  postLikers: 'SELECT userId FROM likes WHERE postId=?',
  savePost:
    "INSERT INTO posts(userId, message, postedAt) VALUES(?,?,datetime('now','localtime'));",
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
    'select t2.postId,t2.userId,t2.message,t2.postedAt from bookmarks t1 join posts t2 on t1.postId=t2.postId where t1.userId=?',
};

module.exports = queries;
