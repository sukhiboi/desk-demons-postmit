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
  post('/add-new-post', { message }).then(() => location.reload());
};

window.onload = function () {
  setupCharCounter();
};
