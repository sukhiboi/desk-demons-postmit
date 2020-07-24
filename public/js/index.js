/* eslint-disable no-unused-vars */
const createNewPostElement = function () {
  const newPostElement = document.createElement('div');
  newPostElement.innerHTML = `          
         <div class="create-new-post">
            <div class="flex">
              <div class="profile-pic"><span>SS</span></div>
              <div class="content">
                <textarea placeholder="What's happening?"></textarea>
              </div>
            </div>
            <button class="primary-btn">Post</button>
          </div>`;
  return newPostElement;
};

const createCloseButton = function () {
  const closeButton = document.createElement('img');
  closeButton.src = '/assets/close.svg';
  closeButton.classList.add('close-btn');
  closeButton.onclick = function () {
    const filter = document.getElementById('filter');
    filter.remove();
  };
  return closeButton;
};

const showNewPostElement = function () {
  const filter = document.createElement('div');
  filter.classList.add('filter');
  filter.id = 'filter';
  const newPostElement = createNewPostElement();
  filter.appendChild(newPostElement);
  const closeBtn = createCloseButton();
  filter.appendChild(closeBtn);
  document.body.appendChild(filter);
};

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
