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
      console.log(response.errMsg);
    }
  });
};
