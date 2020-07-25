const toggleLikeButton = function (target, className) {
  const classToRemove = className.includes('fas')
    ? ['far', 'LikeBtn']
    : ['fas', 'likeColor'];
  target.classList.remove(...classToRemove);
  target.classList.add(...className);
  location.reload();
};

const toggleLikeUnlike = function (postId) {
  const target = event.target;
  if (target.className.includes('far')) {
    sendPOSTRequest('/like', { postId }, () =>
      toggleLikeButton(target, ['fas', 'likeColor'])
    );
    return;
  }
  sendPOSTRequest('/unlike', { postId }, () =>
    toggleLikeButton(target, ['far', 'LikeBtn'])
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

const main = function () {
  initializeHomePostInput();
};

window.onload = main;
