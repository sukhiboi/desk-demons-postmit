const extractProfileName = name => {
  let profileName = '';
  const [firstName, secondName] = name.split(' ');
  profileName = firstName ? profileName + firstName[0] : profileName;
  profileName = secondName ? profileName + secondName[0] : profileName;
  return profileName;
};

const getPostDetails = async (post, dbClient) => {
  const user = await dbClient.getUserDetails(post.user_id);
  user.profileName = extractProfileName(user.name || user.username);
  return Object.assign(user, post);
};

const getPosts = async function (req, res) {
  const dbClient = req.app.locals.dbClient;
  let posts = await dbClient.getPosts();
  posts = await Promise.all(
    posts.map(async post => await getPostDetails(post, dbClient))
  );
  res.render('index', { posts });
};

module.exports = { getPosts };
