const reloadOnStatus = function (response) {
  response.status && setTimeout(() => location.reload(), 200);
};

const isInRange = function (limit, value) {
  return value > limit.min && value <= limit.max;
};

const setupCharCounter = function (counterId, messageId, postBtnId) {
  const counter = document.getElementById(counterId);
  const contentBox = document.getElementById(messageId);
  const postBtn = document.getElementById(postBtnId);
  const disablePrimaryBtnClass = 'disable-primary-btn';
  const charLimit = { min: 0, max: 180 };
  const warningLimit = 10;
  contentBox.addEventListener('input', () => {
    const messageLength = document.getElementById(messageId).innerText.length;
    const remainingChars = charLimit.max - messageLength;
    counter.innerText = remainingChars;
    postBtn.classList.add(disablePrimaryBtnClass);
    counter.closest('.counter').classList.remove('fill-red');
    if (isInRange(charLimit, messageLength)) {
      postBtn.classList.remove(disablePrimaryBtnClass);
    }
    if (remainingChars <= warningLimit) {
      counter.closest('.counter').classList.add('fill-red');
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
  post('/deletePost', { postId }).then(reloadOnStatus);
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

const sendReply = function (postId) {
  const message = document.getElementById('replyMessage').innerText;
  post('/saveResponse', { postId, message })
    .then(response => response.json())
    .then(reloadOnStatus);
};

const replyToPost = function (postId) {
  event.stopPropagation();
  const [userInfo, message] = document.querySelectorAll(`#post-${postId} .row`);
  const replyPopupHtml = `
  <div class="post popup-create-post">
  ${userInfo.outerHTML}
  ${message.outerHTML}
  <div class="row replying-to">
    Replying to ${userInfo.querySelector('.username').outerHTML}
  </div>
  <div class="row">
    <div
      class="content"
      id="replyMessage"
      contenteditable=""
      data-placeholder="Post your Reply"
    ></div>
    </div>
      <div class="row right-aligned">
    <div class="counter"><span id="popupCharCount">180</span></div>
    <button
      class="primary-btn disable-primary-btn"
      id="popupReplyBtn"
      onclick="sendReply(${postId})"
    >
      Reply
    </button>
  </div>
  </div>
  `;
  const element = document.createElement('div');
  element.classList.add('center');
  element.innerHTML = replyPopupHtml;
  displayPopup(element);
  setupCharCounter('popupCharCount', 'replyMessage', 'popupReplyBtn');
};

const expandPost = function (postId) {
  event.stopPropagation();
  window.location.href = `/post/${postId}`;
};
