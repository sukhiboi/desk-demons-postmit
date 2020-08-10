const displayInvalidField = function (element, message) {
  const errorTag = document.getElementById('errorMessage');
  errorTag.innerText = message;
  errorTag.classList.remove('disable-visibility');
  errorTag.classList.add('invalid-detail');
  element.classList.add('highlight');
};

const displayValidField = function (element) {
  const errorTag = document.getElementById('errorMessage');
  errorTag.innerText = '';
  errorTag.classList.add('disable-visibility');
  errorTag.classList.remove('invalid-detail');
  element.classList.remove('highlight');
};

const lengthValidator = function (element, length) {
  const value = element.value;
  let message = '';
  if (value.length > length) {
    message = `${element.id} should be less than ${length} characters.`;
  }
  if (value === '') {
    message = `${element.id} is required`;
  }
  return { message, isValid: message === '' };
};

const usernameValidator = function (element, length) {
  const lengthValidationResult = lengthValidator(element, length);
  if (!lengthValidationResult.isValid) {
    return new Promise(resolve => resolve(lengthValidationResult));
  }
  return new Promise(resolve => {
    post('/isUsernameAvailable', { username: element.value }, ({ status }) => {
      let message = 'username is not available';
      if (status) {
        message = '';
      }
      resolve({ message, isValid: status });
    });
  });
};

const dateValidator = function (element) {
  const value = element.value;
  const date = new Date(value);
  let message = 'date is Invalid';
  if (Number(date)) {
    message = '';
  }
  if (new Date().getTime() - date.getTime() < 0) {
    message = "Date of Birth can't be in future";
  }
  return { message, isValid: message === '' };
};

const validateForm = async function (fields) {
  fields.forEach(field => {
    const element = document.getElementById(field.id);
    displayValidField(element);
  });
  const invalidFields = [];
  for (const field of fields) {
    const element = document.getElementById(field.id);
    const { message, isValid } = await field.validator(element, field.length);
    if (!isValid) {
      invalidFields.push(element);
      displayInvalidField(element, message);
    }
  }
  return invalidFields;
};

const validateFieldsAndGenerateData = async function (fields) {
  const invalidFields = await validateForm(fields);
  if (invalidFields.length) {
    return Promise.reject('Invalid Fields');
  }
  const userDetails = fields.reduce((fieldValues, { id }) => {
    const fieldValue = document.getElementById(id).value;
    return { ...fieldValues, [id]: fieldValue };
  }, {});
  return userDetails;
};

const fields = [
  { id: 'bio', length: 160, validator: lengthValidator },
  { id: 'dob', validator: dateValidator },
  { id: 'name', length: 50, validator: lengthValidator },
  { id: 'username', length: 15, validator: usernameValidator },
];

const saveUser = async function (username, imageUrl) {
  try {
    const userDetails = await validateFieldsAndGenerateData(fields);
    userDetails.githubUsername = username;
    userDetails.imageUrl = imageUrl;
    post('/save-user', userDetails, ({ status }) => {
      if (status) {
        window.location.href = '/home';
      } else {
        window.location.href = '/auth';
      }
    });
  } catch (err) {
    return err;
  }
};

const editProfile = async function () {
  try {
    const userDetails = await validateFieldsAndGenerateData(fields);
    post('/edit-profile', userDetails, ({ status }) => {
      if (status) {
        window.location.href = `/user/${userDetails.username}`;
      } else {
        location.reload();
      }
    });
  } catch (err) {
    return err;
  }
};
