const extractInitials = function (name) {
  const firstLetterIdx = 0;
  const [firstName, secondName] = name.split(' ');
  const firstLetter = firstName[firstLetterIdx];
  const profileName = secondName
    ? firstLetter + secondName[firstLetterIdx]
    : firstLetter;
  return profileName.toUpperCase();
};

const sortByDate = function (list) {
  return list.sort((item1, item2) => {
    return new Date(item2.postedAt) - new Date(item1.postedAt);
  });
};

const isUserPresentInList = function (userId, list) {
  return list.some(user => user.userId === userId);
};

module.exports = {
  extractInitials,
  sortByDate,
  isUserPresentInList,
};
