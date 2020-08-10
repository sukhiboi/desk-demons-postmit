const createConfirmationPopup = function (details) {
  const { heading, message, actionBtnHTML } = details;
  return `
  <div class="delete-popup center">
    <div class="delete-popup-heading">${heading}</div>
    <div class="row delete-popup-message">${message}</div>
    <div class="row action-btn">
      <button class="primary-btn" onclick="removePopup()">Cancel</button>
      ${actionBtnHTML}
    </div>
  </div>
  `;
};

const createLogoutPopup = function () {
  const details = {
    heading: 'Logout?',
    message: 'Are you sure you want to logout?',
    actionBtnHTML: `<a href="/logout"><button
      class="primary-btn delete-btn" >Logout</button></a>`,
  };
  return createConfirmationPopup(details);
};

const createDeletePostPopup = function (postId) {
  const details = {
    heading: 'Delete Post?',
    message: `This can’t be undone and it will be removed from your profile, 
              the timeline of any accounts that follow you.`,
    actionBtnHTML: `<button
      class="primary-btn delete-btn"
      onclick="deletePost(${postId})">Delete</button>`,
  };
  return createConfirmationPopup(details);
};

const createEditProfilePopup = function (user) {
  const { username, name, dob, bio } = user;
  return `
  <div class="description">Update your profile Details</div>
  <div class="row fields">
      <p class="disable-visibility" id="errorMessage">no error</p>
      <div class="field">
        <span class="placeholder" for="username">Username</span>
        <input class="input-bar" id="username" type="text"
        value="${username}"/>
      </div>
      <div class="field">
        <span class="placeholder" for="name">Name</span>
        <input class="input-bar" id="name" type="text" value="${name}"/>
      </div>
      <div class="field">
        <span class="placeholder" for="dob">Date of Birth</span>
        <input class="input-bar" id="dob" type="date"
           placeholder="Date of Birth"
           value="${moment(dob).format('YYYY-MM-DD')}"/>
      </div>
      <div class="field">
        <span class="placeholder" for="bio">Bio</span>
        <textarea class="input-bar" id="bio" rows="4">${bio}</textarea>
      </div>
  </div>
  <div class="row action-btn">
    <button class="primary-btn" onclick="removePopup()">Cancel</button>
    <button class="primary-btn" onclick="editProfile()">Save</button>
  </div>
  `;
};

const replyToPostPopup = function (userInfo, message, postId) {
  return `
  <div class="post popup-create-post center">
  <div class="close-btn" onclick="removePopup()">
    <i class="fas fa-times"></i>
  </div>
  ${userInfo.outerHTML}
  ${message.outerHTML}
  <div class="row replying-to">
    Replying to ${userInfo.querySelector('.username').outerHTML}
  </div>
  <div class="row">
    <div
      class="content big-content"
      id="replyMessage"
      contenteditable=""
      data-placeholder="Post your Reply"
    ></div>
    </div>
      <div class="row right-aligned">
    <div class="counter"><span id="popupCharCount">180</span></div>
    <button
      class="primary-btn disable-primary-btn"
      id="popupReplyBtn"
      onclick="sendReply(${postId})"
    >
      Reply
    </button>
  </div>
  </div>
  `;
};

const createPostPopup = function (profilePic) {
  return `
  <div class="post popup-create-post">
  <div class="close-btn" onclick="removePopup()">
    <i class="fas fa-times"></i>
  </div>
  <div class="row">
  <div class="profile-pic">${profilePic} </div>
    <div
      class="content big-content"
      id="popupPostMessage"
      contenteditable=""
      data-placeholder="What's Happening?"
    ></div>
    </div>
      <div class="row right-aligned">
    <div class="counter"><span id="popupCharCount">180</span></div>
    <button
      class="primary-btn disable-primary-btn"
      id="popupPostBtn"
      onclick="postMessage('popupPostMessage')"
    >
      Post
    </button>
  </div>
  </div>
  `;
};

const getUserResultTemplate = function (user) {
  let profilePic = `<span class="center">${user.initials}</span>`;
  if (user.imageUrl) {
    profilePic = `<img src="${user.imageUrl}">`;
  }
  return `
  <a class="result" href="/user/${user.username}">
    <div>
      <div class="user-info">
        <div class="profile-pic">
          ${profilePic}
        </div>
        <div class="user-details">
          <div class="name">${user.name}</div>
          <div class="username">@${user.username}</div>
        </div>
      </div>
    </div>
  </a>`;
};

const getHashtagResultTemplate = function (hashtag) {
  const hashtagTemplate = `
<a class="result" href="/hashtag/${hashtag}">
    <div class="name"><span class="hashtag">#${hashtag}</span></div>
</a>`;
  return hashtagTemplate;
};
