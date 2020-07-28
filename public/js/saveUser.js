const saveUser = function (username) {
  const fields = ['username', 'name', 'dob', 'bio'];
  const userDetails = fields.reduce((fieldValues, fieldId) => {
    const fieldValue = document.getElementById(fieldId).value;
    return { ...fieldValues, [fieldId]: fieldValue };
  }, {});
  userDetails['githubUsername'] = username;
  sendPOSTRequest('/save-user', userDetails, response => {
    if (Number(response.user_id)) {
      window.location.href = '/home';
    } else {
      location.reload();
    }
  });
};

const displayValidation = function (status, errorTag, continueButton) {
  errorTag.innerText = 'username available';
  errorTag.classList.remove('invalid-detail', 'disable-visibility');
  errorTag.classList.add('valid-detail');
  continueButton.classList.remove('disable-btn');
  if (!status) {
    errorTag.classList.add('invalid-detail');
    errorTag.innerText = 'username is not available';
    continueButton.classList.add('disable-btn');
  }
};

const checkUsernameAvailability = function (username) {
  const errorTag = document.getElementById('errorMessage');
  const continueButton = document.getElementById('continue');
  errorTag.classList.add('disable-visibility');
  sendPOSTRequest('/isUsernameAvailable', { username }, ({ status }) => {
    displayValidation(status, errorTag, continueButton);
    if (username === '') {
      errorTag.classList.add('disable-visibility');
      continueButton.classList.add('disable-btn');
    }
  });
};
