const serveIndexPage = async function (request, response) {
  response.render('index');
};

const authorizeUser = function (request, response) {
  const auth = request.app.locals.auth;
  response.redirect(auth.getAuthorizeUrl());
};

// eslint-disable-next-line max-statements
const handleUserProfile = async function (request, response) {
  const { code, error } = request.query;
  if (error) {
    return response.redirect('/');
  }
  const { auth, datastore } = request.app.locals;
  const { login, avatar_url } = await auth.fetchUserDetails(code);
  const id = await datastore.getIdByGithubUsername(login).catch(() => {});
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
  const details = request.body;
  const datastore = request.app.locals.datastore;
  await datastore.saveUser(details);
  const id = await datastore.getIdByUsername(details.username);
  response.cookie('userId', id.userId);
  response.json({ status: true });
};

const checkUsernameAvailability = async function (request, response) {
  const username = request.body.username;
  const datastore = request.app.locals.datastore;
  const id = await datastore.getIdByUsername(username);
  response.json({ status: id === undefined });
};

module.exports = {
  serveIndexPage,
  handleUserProfile,
  saveUser,
  checkUsernameAvailability,
  authorizeUser,
};
