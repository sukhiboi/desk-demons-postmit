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

window.onload = function () {
  setupCharCounter();
};
