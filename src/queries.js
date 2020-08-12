const select = function (table, field, selection) {
  return `SELECT ${selection} FROM ${table} WHERE ${field}=?`;
};

const insert = function (table) {
  return `INSERT INTO ${table} VALUES (?,?)`;
};
const savePost = function (message, userId, postId, responseParentId) {
  const hashtags = Array.from(new Set(message.match(/\B#\w*-*\w*\b/gi)));
  const saveQuery = `INSERT INTO posts VALUES(${postId}, ${userId}, '${message}', datetime('now','localtime'));`;
  const hashtagQuery = hashtags.reduce(
    (query, hashtag) =>
      query + `INSERT INTO hashtags VALUES (${postId},'${hashtag.slice(1)}');`,
    ''
  );
  const responseQuery =
    responseParentId !== undefined
      ? `INSERT INTO responses VALUES(${responseParentId},${postId});`
      : '';
  return `BEGIN TRANSACTION; ${saveQuery}${hashtagQuery}${responseQuery} COMMIT TRANSACTION;`;
};

const queries = {
  select: select,
  insert: insert,
  savePost,
  getPost:
    'SELECT * FROM posts JOIN users ON users.userId=posts.userId WHERE posts.postId=?',
  userPosts:
    'SELECT * FROM posts JOIN users ON posts.userId=users.userId WHERE posts.userId=? ORDER BY posts.postedAt DESC;',
  following:
    'SELECT users.* FROM followers JOIN users ON followers.followerId=users.userId WHERE followers.userId=?;',
  followers:
    'select users.* from followers join users on followers.userId=users.userId where followers.followerId=?;',
  unlikePost: 'DELETE FROM likes WHERE postId=? AND userId=?',
  undoRepost: 'DELETE FROM reposts WHERE postId=? AND userId=?',
  removePost: function (postId) {
    return `BEGIN TRANSACTION; DELETE FROM posts WHERE postId=${postId}; DELETE FROM likes WHERE postId=${postId};DELETE FROM responses WHERE postId=${postId}; DELETE FROM reposts WHERE postId=${postId}; COMMIT TRANSACTION`;
  },
  unFollowUser: 'DELETE FROM followers WHERE userId=? and followerId=?',
  saveUser:
    "INSERT INTO users(username, githubUsername, name, bio, dob, joinedDate, imageUrl) VALUES(?, ?, ?, ?, ?, date('now'), ?) ",
  likedPosts:
    'SELECT posts.*,users.* FROM posts JOIN likes ON posts.postId=likes.postId JOIN users ON users.userId=posts.userId WHERE likes.userId=? ORDER BY posts.postedAt DESC',
  matchingUsers:
    'SELECT name,username,imageUrl FROM users WHERE name like ? or username like ?;',
  bookmarks:
    'SELECT posts.*,users.* FROM bookmarks JOIN posts ON bookmarks.postId=posts.postId JOIN users ON users.userId=posts.userId WHERE bookmarks.userId=? ORDER BY posts.postedAt DESC',
  postsByHashtag:
    'SELECT posts.*,users.* FROM posts JOIN hashtags ON posts.postId=hashtags.postId JOIN users ON users.userId=posts.userId WHERE hashtags.hashtag=? ORDER BY posts.postedAt DESC',
  removeBookmark: 'DELETE FROM bookmarks WHERE postId=? AND userId=?;',
  matchingHashtags:
    'SELECT DISTINCT hashtag FROM hashtags WHERE hashtag like ?;',
  responses:
    'SELECT posts.*,users.* FROM posts JOIN responses ON posts.postId=responses.responseId JOIN users ON users.userId=posts.userId WHERE responses.postId=? ORDER BY posts.postedAt DESC',
  replyingTo:
    'SELECT users.username FROM users JOIN posts ON users.userId=posts.userId JOIN responses ON responses.postId=posts.postId WHERE responses.responseId=?;',
  userResponses:
    'SELECT t1.postId,t1.responseId FROM responses t1 JOIN posts t2 ON t1.responseId=t2.postId WHERE t2.userId=? order by t2.postedAt DESC;',
  updateUser:
    'UPDATE users SET username=?, name=?, bio=?, dob=? WHERE userId=?',
  reposts:
    'SELECT posts.*,users.* FROM posts JOIN reposts ON posts.postId=reposts.postId JOIN users ON users.userId=posts.userId WHERE reposts.userId=?',
  allReposts:
    'SELECT  users.* FROM reposts JOIN users ON reposts.userId=users.userId  WHERE reposts.postId=?;',
  postLikers:
    'SELECT  users.* FROM likes JOIN users ON likes.userId=users.userId  WHERE likes.postId=?;',
};

module.exports = queries;
