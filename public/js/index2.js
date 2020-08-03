const reloadOnStatus = function (response) {
  response.status && setTimeout(() => location.reload(), 200);
};

const toggleLikeUnlike = function (postId) {
  event.stopPropagation();
  sendPOSTRequest('/toggleLike', { postId }, reloadOnStatus);
};

const toggleBookmark = function (postId) {
  event.stopPropagation();
  sendPOSTRequest('/toggleBookmark', { postId }, reloadOnStatus);
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
  if (target.className.includes('far')) {
    sendPOSTRequest('/toggleLike', { postId }, reloadOnStatus);
  }
};

const sendRequestForProfile = function (username) {
  window.location = `/user/${username}`;
};

const getUserResultTemplate = function (user) {
  return `
  <a class="result" href="/user/${user.username}">
    <div>
      <div class="user-info">
        <div class="profile-pic">
          <span class="center">${user.initials}</span>
        </div>
        <div class="user-details">
          <div class="name">${user.name}</div>
          <div class="username">@${user.username}</div>
        </div>
      </div>
    </div>
  </a>`;
};

const getHashtagResultTemplate = function (hashtag) {
  const hashtagTemplate = `
<a class="result" href="/hashtag/${hashtag}">
    <div class="name"><span class="hashtag">#${hashtag}</span></div>
</a>`;
  return hashtagTemplate;
};

const showSearchResult = function (result, searchInput) {
  let templateCreator = getUserResultTemplate;
  if (searchInput[0] === '#') {
    templateCreator = getHashtagResultTemplate;
  }
  const searchOutputDiv = document.querySelector('.search-output');
  const html = result.reduce((html, result) => {
    return html + templateCreator(result);
  }, '');
  const searchTitle = `
  <div class="search-info">Searching for "${searchInput}"</div>`;
  searchOutputDiv.innerHTML = searchTitle + html;
};

const search = function () {
  const searchInput = event.target.value;
  if (searchInput === '') {
    document.querySelector('.search-output').innerHTML = '';
    return;
  }
  sendPOSTRequest('/search', { searchInput }, result => {
    showSearchResult(result, searchInput);
  });
};

const toggleFollowUnfollow = function (username) {
  sendPOSTRequest('/toggleFollow', { username }, () => location.reload());
};

const showFollowingList = function (username) {
  window.location = `/user/${username}/following`;
};

const showFollowersList = function (username) {
  window.location = `/user/${username}/followers`;
};

const deletePost = function (postId, redirectToHome) {
  sendPOSTRequest('/deletePost', { postId }, () => {
    if (redirectToHome) {
      window.location.href = '/home';
      return;
    }
    location.reload();
  });
};

const removeFilter = function () {
  const filter = document.getElementById('filter');
  filter.remove();
};

const createDeletePopUp = function (postId, redirectToHome) {
  const popup = document.createElement('div');
  popup.innerHTML = `
  <div class="delete-popup">
    <div class="delete-popup-heading">Delete Post?</div>
    <div class="delete-popup-message">This can’t be undone and it will be 
    removed from your profile, 
    the timeline of any accounts that follow you.</div>
    <div class="flex action-btn">
      <button onclick="removeFilter()">Cancel</button>
      <button
      class="delete-btn"
      onclick="deletePost(${postId}, ${redirectToHome})">Delete</button>
    </div>
  </div>
  `;
  return popup;
};

const showDeletePopUp = function (postId, redirectToHome) {
  event.stopPropagation();
  const filter = document.createElement('div');
  filter.classList.add('filter');
  filter.id = 'filter';
  const newPostElement = createDeletePopUp(postId, redirectToHome);
  filter.appendChild(newPostElement);
  document.body.appendChild(filter);
};

const expandPost = function (postId) {
  window.location.href = `/post/${postId}`;
};
