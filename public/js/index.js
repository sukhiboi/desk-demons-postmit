const toggleLikeButton = function (target, className) {
  setTimeout(() => location.reload(), 200);
  const classToRemove = className.includes('fas')
    ? ['far', 'LikeBtn']
    : ['fas', 'likeColor'];
  target.classList.remove(...classToRemove);
  target.classList.add(...className);
};

const toggleLikeUnlike = function (postId) {
  const target = document.querySelector(`#like_${postId}`);
  if (target.className.includes('far')) {
    sendPOSTRequest(
      '/like',
      { postId },
      ({ status }) => status && toggleLikeButton(target, ['fas', 'likeColor'])
    );
    return;
  }
  sendPOSTRequest(
    '/unlike',
    { postId },
    ({ status }) => status && toggleLikeButton(target, ['far', 'LikeBtn'])
  );
};

const addNewPost = function (textareaId) {
  const message = document.getElementById(textareaId).value;
  sendPOSTRequest('/add-new-post', { message }, () => location.reload());
};

const display = function (id) {
  const divToDisable = `#${id === 'posts' ? 'likedPosts' : 'posts'}`;
  const headerToDisable = `#${id === 'posts' ? 'likes-tab' : 'posts-tab'}`;
  document.querySelector(divToDisable).classList.add('disable');
  document.querySelector(headerToDisable).classList.remove('activeTab');
  document.querySelector(`#${id}`).classList.remove('disable');
  event.target.classList.add('activeTab');
};

const handlePostSubmission = function (textarea, postBtn, count) {
  const maxCharacterLength = 180;
  const warningCharacterLength = 170;
  const zero = 0;
  postBtn.classList.add('disable-btn');
  textarea.addEventListener('input', function () {
    const characterLength = textarea.value.length;
    postBtn.classList.remove('disable-btn');
    count.classList.remove('char-count-error');
    if (characterLength === zero || characterLength > maxCharacterLength) {
      postBtn.classList.add('disable-btn');
    }
    if (characterLength >= warningCharacterLength) {
      count.classList.add('char-count-error');
    }
    count.innerText = maxCharacterLength - characterLength;
  });
};

const initializeHomePostInput = function () {
  const message = document.getElementById('newPostMessage');
  const postBtn = document.getElementById('post-btn');
  const charCountElement = document.getElementById('character-count');
  handlePostSubmission(message, postBtn, charCountElement);
};

const initializePopupPostInput = function () {
  const message = document.getElementById('newPopupPostMessage');
  const postBtn = document.getElementById('post-popup-btn');
  const charCountElement = document.getElementById('popup-character-count');
  handlePostSubmission(message, postBtn, charCountElement);
};

const displayHeart = function (postId) {
  const heart = document.querySelector(`#heart_${postId}`);
  heart.classList.add('heart');
  setTimeout(() => heart.classList.remove('heart'), 600);
  const target = document.querySelector(`#like_${postId}`);
  sendPOSTRequest(
    '/like',
    { postId },
    ({ status }) => status && toggleLikeButton(target, ['fas', 'likeColor'])
  );
};

const sendRequestForProfile = function (username) {
  window.location = `/user/${username}`;
};

const showSearchResult = function (result) {
  const searchOutputDiv = document.querySelector('.search-output');
  let html = '';
  result.forEach(result => {
    html += `
<div class="searchedUser" onclick="sendRequestForProfile('${result.username}')">
      <div class="flex">
          <div class="profile-pic"><span>${result.initials}</span></div>
          <div class="user-details">
              <div class="name"><span>${result.name}</span></div>
              <div class="username"><span>@${result.username}</span></div>
          </div>
      </div>
    </div>`;
  });
  searchOutputDiv.innerHTML = html;
};

const search = function () {
  const searchInput = event.target.value;
  if (searchInput === '') {
    document.querySelector('.search-output').innerHTML = '';
    return;
  }
  sendPOSTRequest('/search', { searchInput }, showSearchResult);
};

const toggleFollowUnfollow = function (username) {
  if (event.target.checked) {
    sendPOSTRequest('/follow', { username }, () => location.reload());
    return;
  }
  sendPOSTRequest('/unfollow', { username }, () => location.reload());
};

const showFollowingList = function (username) {
  window.location = `/user/${username}/following`;
};

const main = function () {
  initializeHomePostInput();
};

window.onload = main;
