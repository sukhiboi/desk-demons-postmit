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
};

module.exports = queries;
