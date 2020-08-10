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
  post('/search', { searchInput }, results =>
    displayResults(results, searchInput)
  );
};
