const serveIndexPage = async function (request, response) {
  response.render('index');
};

const authorizeUser = function (request, response) {
  const auth = request.app.locals.auth;
  response.redirect(auth.getAuthorizeUrl());
};

const handleUserProfile = async function (request, response) {
  const { code, error } = request.query;
  if (error) {
    return response.redirect('/');
  }
  const { auth, app } = request.app.locals;
  const { login, avatar_url } = await auth.fetchUserDetails(code);
  const id = await app.getUserId(login).catch(() => {});
  if (id && Number(id.userId)) {
    response.cookie('userId', id.userId);
    return response.redirect('/home');
  }
  response.render('moreDetails', { username: login, imageUrl: avatar_url });
};

const saveUser = async function (request, response) {
  const app = request.app.locals.app;
  const id = await app.saveUser(request.body);
  response.cookie('userId', id.userId);
  response.json({ status: true });
};

const checkUsernameAvailability = async function (request, response) {
  const username = request.body.username;
  const app = request.app.locals.app;
  const status = await app.isUsernameAvailable(username);
  response.json({ status });
};

module.exports = {
  serveIndexPage,
  handleUserProfile,
  saveUser,
  checkUsernameAvailability,
  authorizeUser,
};
