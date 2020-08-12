const serveHome = async function (request, response) {
  const user = request.app.locals.user;
  const postsWithUserInitial = await user.getUserFeed();
  response.render('home', { ...postsWithUserInitial, activePage: 'home' });
};

const serveUserProfile = async function (request, response) {
  const url = request.url;
  const [, activeTab] = url.match(/\/.*\/.*\/(.*)/) || [url, 'posts'];
  const user = request.app.locals.user;
  const userId = request.cookies.userId;
  const { username } = request.params;
  const userProfile = await user.getUserProfile(username);
  const isMyProfile = userId === userProfile.userId;
  response.render('profile', {
    ...userProfile,
    activeTab,
    isMyProfile,
    activePage: isMyProfile ? 'profile' : '',
  });
};

const handleNewPost = async function (request, response) {
  const user = request.app.locals.user;
  const message = request.body.message;
  await user.savePost(message);
  response.json({ status: true });
};

const saveResponse = async function (request, response) {
  const user = request.app.locals.user;
  const { message, postId } = request.body;
  await user.saveResponse(message, postId);
  response.json({ status: true });
};

const expandPost = async function (request, response) {
  const user = request.app.locals.user;
  const postId = Number(request.params.postId);
  const postDetails = await user.getPostDetails(postId);
  response.render('postPage', postDetails);
};

const getPostLikers = async function (request, response) {
  const user = request.app.locals.user;
  const postId = Number(request.params.postId);
  const userList = await user.getPostLikers(postId);
  response.render('userList', userList);
};

const toggleLike = async function (request, response) {
  const user = request.app.locals.user;
  await user.toggleLikeOnPost(request.body.postId);
  response.json({ status: true });
};

const toggleFollowUnFollow = async function (request, response) {
  const user = request.app.locals.user;
  const username = request.body.username;
  await user.toggleFollowingAUser(username);
  response.json({ status: true });
};

const search = async function (request, response) {
  const user = request.app.locals.user;
  const searchInput = request.body.searchInput;
  const searchResult = await user.getSearchSuggestions(searchInput);
  response.send(searchResult);
};

const serveFollowingList = async function (request, response) {
  const username = request.params.username;
  const user = request.app.locals.user;
  const followingList = await user.getFollowingList(username);
  response.render('followersList', followingList);
};

const serveFollowersList = async function (request, response) {
  const username = request.params.username;
  const user = request.app.locals.user;
  const followerList = await user.getFollowersList(username);
  response.render('followersList', followerList);
};

const getRepostedUsers = async function (request, response) {
  const postId = request.params.postId;
  const user = request.app.locals.user;
  const repostedUsers = await user.getRepostedUsers(postId);
  response.render('userList', repostedUsers);
};

const deletePost = async function (request, response) {
  const postId = request.body.postId;
  const user = request.app.locals.user;
  try {
    await user.deletePost(postId);
    response.json({ status: true });
  } catch (err) {
    response.json({ status: false });
  }
};

const serveHashtagPage = async function (request, response) {
  const user = request.app.locals.user;
  const { hashtag } = request.params;
  const posts = await user.getHashtagRelatedPosts(hashtag);
  response.render('hashtagPage', posts);
};

const serveBookmarksPage = async function (request, response) {
  const user = request.app.locals.user;
  const bookmarks = await user.getBookmarks();
  response.render('bookmarks', { ...bookmarks, activePage: 'bookmarks' });
};

const toggleBookmarkOnPost = async function (request, response) {
  const user = request.app.locals.user;
  const { postId } = request.body;
  await user.toggleBookmarkOnPost(postId);
  response.json({ status: true });
};

const toggleRepost = async function (request, response) {
  const user = request.app.locals.user;
  const { postId } = request.body;
  await user.toggleRepost(postId);
  response.json({ status: true });
};

const updateProfile = async function (request, response) {
  const user = request.app.locals.user;
  await user.updateUserDetails(request.body);
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
  toggleRepost,
  updateProfile,
  getRepostedUsers,
};
