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

const parseTimeStamp = function (timeStamp) {
  const timestampFromNow = moment(timeStamp).fromNow();
  if (timestampFromNow.match(/hour|minute|second/)) {
    return timestampFromNow;
  }
  return moment(timeStamp).format('ll');
};

module.exports = { extractInitials, parseTimeStamp };
