const toggleFollowUnFollow = function (username) {
  post('/toggleFollow', { username }).then(() => location.reload());
};

const pad = number => number.toString().padStart(2, '0');

const displayEditProfile = function () {
  const username = document.querySelector('.username a').innerText;
  const name = document.querySelector('.name a').innerText;
  const dob = new Date(document.querySelector('.dob').innerText);
  const bio = document.querySelector('.bio').innerText;
  const birthdate = `${dob.getFullYear()}-${pad(dob.getMonth())}-${pad(
    dob.getDate()
  )}`;
  const html = `
  <div class="description">Update your profile Details</div>
  <div class="row fields">
      <p class="disable-visibility" id="errorMessage">no error</p>
      <div class="field">
        <span class="placeholder" for="username">Username</span>
        <input class="input-bar" id="username" type="text"
        value="${username.slice(1)}"/>
      </div>
      <div class="field">
        <span class="placeholder" for="name">Name</span>
        <input class="input-bar" id="name" type="text" value="${name}"/>
      </div>
      <div class="field">
        <span class="placeholder" for="dob">Date of Birth</span>
        <input class="input-bar" id="dob" type="date"
           placeholder="Date of Birth"
           value="${birthdate}"/>
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
  const element = document.createElement('div');
  element.classList.add('form', 'center');
  element.innerHTML = html;
  displayPopup(element);
};
