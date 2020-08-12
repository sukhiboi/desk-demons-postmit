const express = require('express');
const bodyParser = require('body-parser');
const handlers = require('./userHandlers');

const userRoute = express.Router();
userRoute.use(bodyParser.json({ extended: true }));

const isUserLoggedIn = function (request, response, next) {
  const userId = request.cookies.userId;
  if (userId) {
    next();
    return;
  }
  response.redirect('/auth');
};

const updateUser = function (request, response, next) {
  const id = request.cookies.userId;
  request.cookies.userId = Number(id);
  const user = request.app.locals.user;
  user.updateUser(Number(id)).catch(() => {});
  next();
};

userRoute.use(isUserLoggedIn);
userRoute.use(updateUser);
userRoute.get('/home', handlers.serveHome);
userRoute.get('/user/bookmarks', handlers.serveBookmarksPage);
userRoute.get('/user/:username', handlers.serveUserProfile);
userRoute.get('/user/:username/likes', handlers.serveUserProfile);
userRoute.get('/user/:username/replies', handlers.serveUserProfile);
userRoute.get('/user/:username/following', handlers.serveFollowingList);
userRoute.get('/user/:username/followers', handlers.serveFollowersList);
userRoute.get('/post/:postId', handlers.expandPost);
userRoute.get('/post/:postId/likes', handlers.getPostLikers);
userRoute.get('/post/:postId/reposts', handlers.getRepostedUsers);
userRoute.get('/hashtag/:hashtag', handlers.serveHashtagPage);
userRoute.get('/logout', function (request, response) {
  response.clearCookie('userId');
  response.redirect('/');
});

userRoute.post('/add-new-post', handlers.handleNewPost);
userRoute.post('/saveResponse', handlers.saveResponse);
userRoute.post('/toggleLike', handlers.toggleLike);
userRoute.post('/search', handlers.search);
userRoute.post('/toggleFollow', handlers.toggleFollowUnFollow);
userRoute.post('/deletePost', handlers.deletePost);
userRoute.post('/toggleBookmark', handlers.toggleBookmarkOnPost);
userRoute.post('/edit-profile', handlers.updateProfile);
userRoute.post('/toggleRepost', handlers.toggleRepost);

module.exports = userRoute;
