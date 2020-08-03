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
  response.redirect('/');
};
userRoute.use(isUserLoggedIn);
userRoute.get('/home', handlers.serveHome);
userRoute.get('/user/bookmarks', handlers.serveBookmarksPage);
userRoute.get('/user/:username', handlers.serveUserProfile);
userRoute.get( '/user/:username/likes', handlers.serveUserProfileWithLikes );
userRoute.get( '/user/:username/following', handlers.serveFollowingList );
userRoute.get( '/user/:username/followers', handlers.serveFollowersList );
userRoute.get('/post/:postId', handlers.expandPost);
userRoute.get('/post/:postId/likes', handlers.getPostLikers);
userRoute.get('/hashtag/:hashtag', handlers.serveHashtagPage);
userRoute.get('/logout', function (request, response) {
  response.cookie('userId', { expires: Date.now() });
  response.redirect('/');
});

userRoute.post('/add-new-post', handlers.handleNewPost);
userRoute.post('/saveResponse', handlers.saveResponse);
userRoute.post('/toggleLike', handlers.toggleLike);
userRoute.post('/search', handlers.search);
userRoute.post('/toggleFollow', handlers.toggleFollowUnFollow);
userRoute.post('/deletePost', handlers.deletePost);
userRoute.post( '/toggleBookmark', handlers.toggleBookmarkOnPost );

module.exports = userRoute;
