const createNewPostElement = function (placeholder, onClickListener, postId) {
  const newPostElement = document.createElement('div');
  newPostElement.innerHTML = `
    <div class="create-new-post popup">
  <div class="flex">
  <div onclick="closePopup()"><i class="fas fa-times close-btn"></i></div>
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

const closePopup = function () {
  const filter = document.getElementById('filter');
  filter.remove();
};

const saveResponse = function (textareaId, postId) {
  const message = document.getElementById(textareaId).value;
  sendPOSTRequest('/saveResponse', { message, postId }, reloadOnStatus);
};

const showPopup = function (placeholder, listener, postId) {
  event.stopPropagation();
  const filter = document.createElement('div');
  filter.classList.add('filter');
  filter.id = 'filter';
  const newPostElement = createNewPostElement(placeholder, listener, postId);
  filter.appendChild(newPostElement);
  document.body.appendChild(filter);
  initializePopupPostInput();
};
