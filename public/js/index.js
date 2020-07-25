const toggleLikeButton = function (target, className) {
  const classToRemove = className === 'fas' ? 'far' : 'fas';
  target.classList.remove(classToRemove);
  target.classList.add(className);
};

const toggleLikeUnlike = function (postId) {
  const target = event.target;
  if (target.className.includes('far')) {
    sendPOSTRequest('/like', { postId }, () => toggleLikeButton(target, 'fas'));
    return;
  }
  sendPOSTRequest('/unlike', { postId }, () => toggleLikeButton(target, 'far'));
};

const addNewPost = function () {
  const message = document.getElementById('newPostMessage').value;
  sendPOSTRequest('/add-new-post', { message });
};

const main = function () {
  const message = document.getElementById('newPostMessage');
  const postBtn = document.getElementById('post-btn');
  postBtn.classList.add('disable-btn');
  message.addEventListener('input', function () {
    const characterLength = message.value.length;
    postBtn.classList.remove('disable-btn');
    if (characterLength === 0 || characterLength > 180) {
      postBtn.classList.add('disable-btn');
    }
  });
};

window.onload = main;
