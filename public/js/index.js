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
