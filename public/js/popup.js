const createNewPostElement = function (placeholder, onClickListener, postId) {
  const newPostElement = document.createElement('div');
  newPostElement.innerHTML = `
    <div class="create-new-post">
  <div class="flex">
    <div class="profile-pic"><span>NK</span></div>
    <div class="content">
      <textarea
        id="newPopupPostMessage"
        placeholder="${placeholder}"
        rows="3"
      ></textarea>
    </div>
  </div>
  <div class="flex action-bar">
    <span class="message-character-count" id="popup-character-count">180</span
    ><button
      class="primary-btn"
      id="post-popup-btn"
      onclick="${onClickListener}('newPopupPostMessage', ${postId})">
      Post
    </button>
  </div>
</div>
    `;
  return newPostElement;
};

const addNewPost = function (textareaId) {
  const message = document.getElementById(textareaId).value;
  sendPOSTRequest('/add-new-post', { message }, reloadOnStatus);
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
  const placeholder = "Whats's Happening?";
  const newPostElement = createNewPostElement(placeholder, 'addNewPost');
  filter.appendChild(newPostElement);
  const closeBtn = createCloseButton();
  filter.appendChild(closeBtn);
  document.body.appendChild(filter);
  initializePopupPostInput();
};

const saveResponse = function (textareaId, postId) {
  const message = document.getElementById(textareaId).value;
  sendPOSTRequest('/saveResponse', { message, postId }, reloadOnStatus);
};

const showResponsePopup = function (postId) {
  event.stopPropagation();
  const filter = document.createElement('div');
  filter.classList.add('filter');
  filter.id = 'filter';
  const newPostElement = createNewPostElement(
    'Post your Reply',
    'saveResponse',
    postId
  );
  filter.appendChild(newPostElement);
  const closeBtn = createCloseButton();
  filter.appendChild(closeBtn);
  document.body.appendChild(filter);
  initializePopupPostInput();
};
