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
  const { auth, user } = request.app.locals;
  const { login, avatar_url } = await auth.fetchUserDetails(code);
  const id = await user.getUserId(login).catch(() => {});
  if (id && Number(id.userId)) {
    response.cookie('userId', id.userId);
    return response.redirect('/home');
  }
  response.render('extraUserDetails', {
    username: login,
    imageUrl: avatar_url,
  });
};

const saveUser = async function (request, response) {
  const user = request.app.locals.user;
  const id = await user.saveUser(request.body);
  response.cookie('userId', id.userId);
  response.json({ status: true });
};

const checkUsernameAvailability = async function (request, response) {
  const username = request.body.username;
  const user = request.app.locals.user;
  const status = await user.isUsernameAvailable(username);
  response.json({ status });
};

module.exports = {
  serveIndexPage,
  handleUserProfile,
  saveUser,
  checkUsernameAvailability,
  authorizeUser,
};
