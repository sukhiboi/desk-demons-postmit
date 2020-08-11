const select = function (table, field, selection) {
  return `SELECT ${selection} FROM ${table} WHERE ${field}=?`;
};

const insert = function (table) {
  return `INSERT INTO ${table} VALUES (?,?)`;
};

const queries = {
  select: select,
  insert: insert,
  getPost:
    'SELECT * FROM posts join users on users.userId=posts.userId WHERE posts.postId=?',
  userPosts:
    'select * from posts join users on posts.userId=users.userId where posts.userId=? ORDER BY posts.postedAt DESC;',
  following:
    'select users.* from followers join users on followers.followerId=users.userId where followers.userId=?;',
  followers:
    'select users.* from followers join users on followers.userId=users.userId where followers.followerId=?;',
  savePost:
    "INSERT INTO posts(postId, userId, message, postedAt) VALUES(?, ?, ?, datetime('now','localtime'));",
  unlikePost: 'DELETE FROM likes WHERE postId=? AND userId=?',
  undoRepost: 'DELETE FROM reposts WHERE postId=? AND userId=?',
  removePost: function (postId) {
    return `BEGIN TRANSACTION; DELETE FROM posts WHERE postId=${postId}; DELETE FROM likes WHERE postId=${postId};DELETE FROM responses WHERE postId=${postId}; DELETE FROM reposts WHERE postId=${postId}; COMMIT TRANSACTION`;
  },
  unFollowUser: 'DELETE FROM followers WHERE userId=? and followerId=?',
  saveUser:
    "INSERT INTO users(username, githubUsername, name, bio, dob, joinedDate, imageUrl) VALUES(?, ?, ?, ?, ?, date('now'), ?) ",
  likedPosts:
    'SELECT posts.*,users.* FROM posts JOIN likes ON posts.postId=likes.postId JOIN users on users.userId=posts.userId WHERE likes.userId=? ORDER BY posts.postedAt DESC',
  matchingUsers:
    'SELECT name,username,imageUrl from users where name like ? or username like ?;',
  bookmarks:
    'SELECT posts.*,users.* FROM bookmarks JOIN posts ON bookmarks.postId=posts.postId JOIN users ON users.userId=posts.userId WHERE bookmarks.userId=? ORDER BY posts.postedAt DESC',
  postsByHashtag:
    'SELECT posts.*,users.* FROM posts JOIN hashtags ON posts.postId=hashtags.postId JOIN users on users.userId=posts.userId WHERE hashtags.hashtag=? ORDER BY posts.postedAt DESC',
  removeBookmark: 'DELETE FROM bookmarks WHERE postId=? AND userId=?;',
  matchingHashtags:
    'SELECT DISTINCT hashtag from hashtags where hashtag like ?;',
  responses:
    'SELECT posts.*,users.* FROM posts JOIN responses ON posts.postId=responses.responseId JOIN users on users.userId=posts.userId WHERE responses.postId=? ORDER BY posts.postedAt DESC',
  replyingTo:
    'select users.username from users join posts on users.userId=posts.userId join responses on responses.postId=posts.postId where responses.responseId=?;',
  userResponses:
    'select t1.postId,t1.responseId from responses t1 join posts t2 on t1.responseId=t2.postId where t2.userId=? order by t2.postedAt DESC;',
  updateUser:
    'UPDATE users SET username=?, name=?, bio=?, dob=? WHERE userId=?',
  reposts:
    'select posts.*,users.* from posts JOIN reposts ON posts.postId=reposts.postId JOIN users on users.userId=posts.userId where reposts.userId=?',
  allReposts:
    'select  users.* from reposts join users on reposts.userId=users.userId  where reposts.postId=?;',
  postLikers:
    'select  users.* from likes join users on likes.userId=users.userId  where likes.postId=?;',
};

module.exports = queries;
