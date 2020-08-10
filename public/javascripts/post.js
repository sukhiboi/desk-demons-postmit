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
  if (!counter || !contentBox || !postBtn) {
    return;
  }
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

const postMessage = function (textareaId = 'message') {
  const message = document.getElementById(textareaId).innerText;
  post('/add-new-post', { message }, reloadOnStatus);
};

const toggleLikeUnlike = function (postId) {
  event.stopPropagation();
  post('/toggleLike', { postId }, reloadOnStatus);
};

const toggleBookmark = function (postId) {
  event.stopPropagation();
  post('/toggleBookmark', { postId }, reloadOnStatus);
};

const toggleRepost = function (postId) {
  event.stopPropagation();
  post('/toggleRepost', { postId }, reloadOnStatus);
};

const deletePost = function (postId) {
  post('/deletePost', { postId }, reloadOnStatus);
};

const showDeletePostPopup = function (postId) {
  const element = document.createElement('div');
  element.innerHTML = createDeletePostPopup(postId);
  displayPopup(element);
};

const sendReply = function (postId) {
  const message = document.getElementById('replyMessage').innerText;
  post('/saveResponse', { postId, message }, reloadOnStatus);
};

const replyToPost = function (postId) {
  event.stopPropagation();
  const [userInfo, message] = document.querySelectorAll(`#post-${postId} .row`);
  const element = document.createElement('div');
  element.innerHTML = replyToPostPopup(userInfo, message, postId);
  displayPopup(element);
  setupCharCounter('popupCharCount', 'replyMessage', 'popupReplyBtn');
};

const showPostPopup = function (initials, imageUrl) {
  let profilePic = `<span class="center">${initials}</span>`;
  if (imageUrl) {
    profilePic = `<img src="${imageUrl}">`;
  }
  event.stopPropagation();
  const element = document.createElement('div');
  element.classList.add('center');
  element.innerHTML = createPostPopup(profilePic);
  displayPopup(element);
  setupCharCounter('popupCharCount', 'popupPostMessage', 'popupPostBtn');
};

const expandPost = function (postId) {
  event.stopPropagation();
  window.location.href = `/post/${postId}`;
};

window.onload = () => setupCharCounter('char-count', 'message', 'post-btn');
