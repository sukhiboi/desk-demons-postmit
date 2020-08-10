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

const displayResults = function (results, searchInput) {
  const templateCreator = {
    '#': getHashtagResultTemplate,
    '@': getUserResultTemplate,
  };
  const firstChar = searchInput[0];
  const creator = templateCreator[firstChar];
  const html = results.reduce((html, results) => html + creator(results), '');
  const searchTitle = `
    <div class="search-info">Searching for "${searchInput}"</div>`;
  const searchResults = document.querySelector('.search-output');
  searchResults.innerHTML = searchTitle + html;
};

const search = function (searchInput) {
  if (searchInput === '') {
    const searchResults = document.querySelector('.search-output');
    searchResults.innerHTML = '';
    return;
  }
  post('/search', { searchInput })
    .then(response => response.json())
    .then(results => displayResults(results, searchInput));
};
