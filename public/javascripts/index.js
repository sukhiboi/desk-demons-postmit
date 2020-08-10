const toggleFollowUnFollow = function (username) {
  post('/toggleFollow', { username }, () => location.reload());
};

const displayLogoutPopup = function () {
  const element = document.createElement('div');
  element.innerHTML = createLogoutPopup();
  displayPopup(element);
};

const displayEditProfile = function () {
  const username = document.querySelector('.username a').innerText;
  const name = document.querySelector('.name a').innerText;
  const dob = new Date(document.querySelector('.dob').innerText);
  const bio = document.querySelector('.bio').innerText;
  const user = { username: username.slice(1), name, dob, bio };
  const element = document.createElement('div');
  element.classList.add('form', 'center');
  element.innerHTML = createEditProfilePopup(user);
  displayPopup(element);
};
