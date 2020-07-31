const moment = require('moment');

const extractInitials = function (name) {
  const firstLetterIdx = 0;
  const [firstName, secondName] = name.split(' ');
  const firstLetter = firstName[firstLetterIdx];
  const profileName = secondName
    ? firstLetter + secondName[firstLetterIdx]
    : firstLetter;
  return profileName.toUpperCase();
};

const formatDate = date => moment(date).format('ll');

const parseTimeStamp = function (timeStamp) {
  const timestampFromNow = moment(timeStamp).fromNow();
  if (timestampFromNow.match(/hour|minute|second/)) {
    return timestampFromNow;
  }
  return formatDate(timeStamp);
};

const sortByDate = function (list) {
  return list.sort((item1, item2) => {
    return new Date(item2.postedAt) - new Date(item1.postedAt);
  });
};

const isUserPresentInList = function (userId, list) {
  return list.some(user => user.userId === userId);
};

const createPostId = function (userId, postedAt) {
  return userId + new Date(postedAt).getTime();
};

module.exports = {
  extractInitials,
  parseTimeStamp,
  formatDate,
  sortByDate,
  isUserPresentInList,
  createPostId,
};
