class PostsHandler {
  constructor(db) {
    this.db = db;
    this.posts = db('posts');
    this.likes = db('likes');
    this.resposts = db('reposts');
  }

  getUserPosts(userId) {
    return this.posts
      .join('users', 'posts.userId', '=', 'users.userId')
      .where('posts.userId', userId)
      .orderBy('posts.postedAt', 'desc')
      .select();
  }

  savePost(userId, message, responseParentId) {
    return this.db.transaction(trx => {
      const postId = userId + new Date().getTime();
      const hashtags = Array.from(new Set(message.match(/\B#\w*-*\w*\b/gi)));
      trx
        .insert({postId, userId, message, postedAt: new Date()})
        .into('posts')
        .then(() => {
          return Promise.all(hashtags.map(hashtag => {
            return trx
              .insert({postId, hashtag: hashtag.slice(1)})
              .into('hashtags');
          }));
        })
        .then(() => {
          if (responseParentId == undefined) {
            return new Promise(() => undefined);
          }
          return trx
            .insert({responseId: responseParentId, postId})
            .into('responses');
        });
    }).then(() => {
      console.log('new Post added to db');
    }).catch(() => {
      console.log('you messed up');
    });
  }

  removePost(postId) {
  }

  getPost(postId) {
    return this.posts
      .join('users', 'posts.userId', '=', 'users.userId')
      .where('posts.postId', postId)
      .select();
  }

  likePost(postId, userId) {
    return this.likes.insert({postId, userId});
  }

  unlikePost(postId, userId) {
    return this.likes.where({postId, userId}).del();
  }

  getLikedPosts(userId) {
    return this.posts
      .join('likes', 'posts.postId', '=', 'likes.postId')
      .join('users', 'posts.userId', '=', 'users.userId')
      .where('likes.userId', userId)
      .orderBy('posts.postedAt', 'desc')
      .select('posts.*', 'users.*');
  }

  repost(postId, userId) {
    return this.resposts.insert({postId, userId});
  }

  undoRepost(postId, userId) {
    return this.resposts.where({postId, userId}).del();
  }

  getHashtagsByPostId(postId) {
    this.db('hashtags')
      .where({postId})
      .select('hashtag');
  }

  getPostsByHashtag(hashtag) {
    return this.posts
      .join('hashtags', 'posts.postId', '=', 'hashtags.postId')
      .join('users', 'posts.userId', '=', 'users.userId')
      .where('hashtags.hashtag', hashtag)
      .orderBy('posts.postedAt', 'desc')
      .select('posts.*', 'users.*');
  }

  getRepostsByUserId(userId) {
    return this.posts
      .select('posts.*', 'users.*')
      .join('reposts', 'posts.postId', '=', 'reposts.postId')
      .join('users', 'posts.userId', '=', 'users.userId')
      .where('reposts.userId', userId);
  }

  getAllReposts(postId) {
    return this.db('reposts')
      .join('users', 'reposts.userId', '=', 'users.userId')
      .where('reposts.postId', postId)
      .select('users.*');//check req.
  }

  getAllPostLikers(postId) {
    return this.likes
      .join('users', 'likes.userId', '=', 'users.userId')
      .where('likes.postId', postId)
      .select('users.*');
  }

  getAllResponses(postId) {
    return this.posts
      .join('responses', 'posts.postId', '=', 'responses.responseId')
      .join('users', 'posts.userId', '=', 'users.userId')
      .where('responses.postId', postId)
      .orderBy('posts.postedAt', 'desc')
      .select('posts.*', 'users.*');
  }

  getReplyingTo(postId) {
    return this.db('users')
      .join('posts', 'users.userId', '=', 'posts.userId')
      .join('responses', 'posts.postId', '=', 'responses.postId')
      .where('responses.responseId', postId)
      .select('users.username');
  }

  getUserResponses(userId) {
    return this.db('responses')
      .join('posts', 'responses.responseId', '=', 'posts.postId')
      .where('posts.userId', userId)
      .orderBy('posts.postedAt', 'desc')
      .select('responses.postId', 'responses.responseId');
  }
}

class UserHandler {
  constructor(db) {
    this.db = db;
    this.users = db('users');
  }

  getUserDetails(userId) {
    return this.users.where({userId}).select();
  }

  followUser(userId, followerId) {
    return this.db('followers').insert({userId, followerId});
  }

  unFollowUser(userId, followerId) {
    return this.db('followers').where({userId, followerId}).del();
  }

  getFollowers(userId) {
    return this.db('followers')
      .join('users', 'followers.userId', '=', 'users.userId')
      .where('followers.followerId', userId)
      .select('users.*');
  }

  getFollowing(userId) {
    return this.db('followers')
      .join('users', 'followers.followerId', '=', 'users.userId')
      .where('followers.userId', userId)
      .select('users.*');
  }

  getIdByUsername(username) {
    return this.users
      .select()
      .where('username', username)
      .returning('userId');
  }

  getIdByGithubUsername(githubUsername) {
    return this.users
      .where({githubUsername})
      .select('userId');
  }

  saveUser(userDetails) {
    return this.users.insert({
      ...userDetails,
      joinedDate: new Date()
    }).returning('userId');
  }

  updateUserDetails(userId, newDetails) {
    return this.users.where({userId}).update(newDetails);
  }
}

class Search {
  constructor(db) {
    this.db = db;
    this.users = db('users');
  }

  getMatchingUsers(searchInput) {
    return this.users
      .where('name', 'like', searchInput + '%')
      .orWhere('username', 'like', searchInput + '%')
      .select('name', 'username', 'imageUrl');

  }

  getMatchingHashtags(searchInput) {
    return this.db('hashtags')
      .where('hashtag', 'like', searchInput + '%')
      .distinct('hashtag');
  }
}

class BookmarkHandler {
  constructor(db) {
    this.db = db;
    this.bookmarks = db('bookmarks');
  }

  getBookmarks(userId) {
    return this.bookmarks
      .join('posts', 'bookmarks.postId', '=', 'posts.postId')
      .join('users', 'posts.userId', '=', 'users.userId')
      .where('bookmarks.userId', userId)
      .orderBy('posts.postedAt', 'desc')
      .select('posts.*', 'users.*');
  }

  addBookmark(postId, userId) {
    return this.bookmarks.insert({postId, userId});
  }

  removeBookmark(postId, userId) {
    return this.bookmarks.where({postId, userId}).del();
  }
}

class Database {
  constructor(db) {
    this.posts = new PostsHandler(db);
    this.users = new UserHandler(db);
    this.search = new Search(db);
    this.bookmarks = new BookmarkHandler(db);
  }
}

module.exports = Database;
