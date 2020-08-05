const updateProfileDates = function () {
  const dob = document.querySelector('.dob');
  const joinedDate = document.querySelector('.joinedDate');
  if (!dob || !joinedDate) {
    return;
  }
  dob.innerText = `Born ${moment(dob.innerText).format('ll')}`;
  joinedDate.innerText = `Joined ${moment(joinedDate.innerText).format('ll')}`;
};

const updatePostTime = function () {
  const timeStamps = document.querySelectorAll('.timestamp');
  timeStamps.forEach(timeStamp => {
    const timeStampText = timeStamp.dataset.time;
    const timestampFromNow = moment(timeStampText).fromNow();
    timeStamp.innerText = ` ・ ${moment(timeStampText).format('ll')}`;
    if (timestampFromNow.match(/hour|minute|second/)) {
      timeStamp.innerText = ` ・ ${timestampFromNow}`;
    }
  });
};

const interval = 10000;
updatePostTime();
updateProfileDates();
setInterval(updatePostTime, interval);
