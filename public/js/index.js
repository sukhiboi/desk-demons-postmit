const toggleFollowUnFollow = function (username) {
  post('/toggleFollow', { username }).then(() => location.reload());
};
