const reloadOnStatus = function (response) {
  response.status && setTimeout(() => location.reload(), 200);
};

const isInRange = function (limit, value) {
  return value > limit.min && value <= limit.max;
};

const setupCharCounter = function () {
  const counter = document.getElementById('char-count');
  const contentBox = document.getElementById('message');
  const postBtn = document.getElementById('post-btn');
  const disablePrimaryBtnClass = 'disable-primary-btn';
  const charLimit = { min: 0, max: 180 };
  contentBox.addEventListener('input', () => {
    const messageLength = document.getElementById('message').innerText.length;
    counter.innerText = charLimit.max - messageLength;
    postBtn.classList.add(disablePrimaryBtnClass);
    if (isInRange(charLimit, messageLength)) {
      postBtn.classList.remove(disablePrimaryBtnClass);
    }
  });
};

const postMessage = function () {
  const message = document.getElementById('message').innerText;
  post('/add-new-post', { message })
    .then(response => response.json())
    .then(reloadOnStatus);
};

const toggleLikeUnlike = function (postId) {
  event.stopPropagation();
  post('/toggleLike', { postId })
    .then(response => response.json())
    .then(reloadOnStatus);
};

const toggleBookmark = function (postId) {
  event.stopPropagation();
  post('/toggleBookmark', { postId })
    .then(response => response.json())
    .then(reloadOnStatus);
};

const deletePost = function (postId) {
  post('/deletePost', { postId }).then(() => location.reload());
};

const showDeletePostPopup = function (postId) {
  const deletePopupHtml = `
  <div class="delete-popup center">
    <div class="delete-popup-heading">Delete Post?</div>
    <div class="row delete-popup-message">This can’t be undone and it will be 
    removed from your profile, 
    the timeline of any accounts that follow you.</div>
    <div class="row action-btn">
      <button class="primary-btn" onclick="removePopup()">Cancel</button>
      <button
      class="primary-btn delete-btn"
      onclick="deletePost(${postId})">Delete</button>
    </div>
  </div>
  `;
  const element = document.createElement('div');
  element.innerHTML = deletePopupHtml;
  displayPopup(element);
};

const expandPost = function (postId) {
  window.location.href = `/post/${postId}`;
};
