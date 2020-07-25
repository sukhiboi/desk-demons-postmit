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

const display = function (id) {
  const divToDisable = `#${id === 'posts' ? 'likedPosts' : 'posts'}`;
  const headerToDisable = `#${id === 'posts' ? 'likes-tab' : 'posts-tab'}`;
  document.querySelector(divToDisable).classList.add('disable');
  document.querySelector(headerToDisable).classList.remove('activeTab');
  document.querySelector(`#${id}`).classList.remove('disable');
  event.target.classList.add('activeTab');
};

const main = function () {
  const message = document.getElementById('newPostMessage');
  const postBtn = document.getElementById('post-btn');
  const charCountElement = document.getElementById('character-count');
  postBtn.classList.add('disable-btn');
  message.addEventListener('input', function () {
    const characterLength = message.value.length;
    postBtn.classList.remove('disable-btn');
    charCountElement.classList.remove('char-count-error');
    if (characterLength === 0 || characterLength > 180) {
      postBtn.classList.add('disable-btn');
    }
    if (characterLength >= 170) {
      charCountElement.classList.add('char-count-error');
    }
    charCountElement.innerText = 180 - characterLength;
  });
};

window.onload = main;
