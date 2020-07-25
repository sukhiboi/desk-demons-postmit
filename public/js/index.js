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

const addNewPost = function () {
  const message = document.getElementById('newPostMessage').value;
  sendPOSTRequest('/add-new-post', { message }, () => location.reload());
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
