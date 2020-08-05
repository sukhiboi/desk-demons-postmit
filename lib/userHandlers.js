const serveHome = async function (request, response) {
  const app = request.app.locals.app;
  const postsWithUserInitial = await app.getUserFeed();
  response.render('home', { ...postsWithUserInitial, activePage: 'home' });
};

const serveUserProfile = async function (request, response) {
  const app = request.app.locals.app;
  const userId = request.cookies.userId;
  const { username } = request.params;
  const userProfile = await app.getUserProfile(username);
  const isMyProfile = userId === userProfile.userId;
  response.render('profile', {
    ...userProfile,
    isMyProfile,
    activePage: isMyProfile ? 'profile' : '',
  });
};

const serveUserProfileWithLikes = async function (request, response) {
  const app = request.app.locals.app;
  const userId = request.cookies.userId;
  const { username } = request.params;
  const userProfile = await app.getUserProfile(username);
  const isMyProfile = userId === userProfile.userId;
  response.render('profileWithLikes', {
    ...userProfile,
    isMyProfile,
    activePage: isMyProfile ? 'profile' : '',
  });
};

const serveUserProfileWithReplies = async function (request, response) {
  const app = request.app.locals.app;
  const userId = request.cookies.userId;
  const { username } = request.params;
  const userProfile = await app.getUserProfile(username);
  const isMyProfile = userId === userProfile.userId;
  response.render('profileWithReplies', {
    ...userProfile,
    isMyProfile,
    activePage: isMyProfile ? 'profile' : '',
  });
};

const handleNewPost = async function (request, response) {
  const app = request.app.locals.app;
  const message = request.body.message;
  await app.savePost(message);
  response.json({ status: true });
};

const saveResponse = async function (request, response) {
  const app = request.app.locals.app;
  const { message, postId } = request.body;
  await app.saveResponse(message, postId);
  response.json({ status: true });
};

const expandPost = async function (request, response) {
  const app = request.app.locals.app;
  const postId = Number(request.params.postId);
  const postDetails = await app.getPostDetails(postId);
  response.render('postPage', postDetails);
};

const getPostLikers = async function (request, response) {
  const app = request.app.locals.app;
  const postId = Number(request.params.postId);
  const userList = await app.getPostLikers(postId);
  response.render('userList', userList);
};

const toggleLike = async function (request, response) {
  const app = request.app.locals.app;
  await app.toggleLikeOnPost(request.body.postId);
  response.json({ status: true });
};

const toggleFollowUnFollow = async function (request, response) {
  const app = request.app.locals.app;
  const username = request.body.username;
  await app.toggleFollowingAUser(username);
  response.json({ status: true });
};

const search = async function (request, response) {
  const app = request.app.locals.app;
  const searchInput = request.body.searchInput;
  const searchResult = await app.getSearchSuggestions(searchInput);
  response.send(searchResult);
};

const serveFollowingList = async function (request, response) {
  const username = request.params.username;
  const app = request.app.locals.app;
  const followingList = await app.getFollowingList(username);
  response.render('following', followingList);
};

const serveFollowersList = async function (request, response) {
  const username = request.params.username;
  const app = request.app.locals.app;
  const followerList = await app.getFollowersList(username);
  response.render('following', followerList);
};

const deletePost = async function (request, response) {
  const postId = request.body.postId;
  const app = request.app.locals.app;
  try {
    await app.deletePost(postId);
    response.json({ status: true });
  } catch (err) {
    response.json({ status: false });
  }
};

const serveHashtagPage = async function (request, response) {
  const app = request.app.locals.app;
  const { hashtag } = request.params;
  const posts = await app.getHashtagRelatedPosts(hashtag);
  response.render('hashtagPage', posts);
};

const serveBookmarksPage = async function (request, response) {
  const app = request.app.locals.app;
  const bookmarks = await app.getBookmarks();
  response.render('bookmarks', { ...bookmarks, activePage: 'bookmarks' });
};

const toggleBookmarkOnPost = async function (request, response) {
  const app = request.app.locals.app;
  const { postId } = request.body;
  await app.toggleBookmarkOnPost(postId);
  response.json({ status: true });
};

module.exports = {
  serveHome,
  handleNewPost,
  saveResponse,
  search,
  serveUserProfile,
  getPostLikers,
  toggleFollowUnFollow,
  serveFollowingList,
  serveFollowersList,
  deletePost,
  toggleLike,
  expandPost,
  serveHashtagPage,
  serveBookmarksPage,
  toggleBookmarkOnPost,
  serveUserProfileWithLikes,
  serveUserProfileWithReplies,
};
