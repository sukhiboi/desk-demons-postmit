const displayResults = function (results, searchInput) {
  const searchResults = document.querySelector('.search-output');
  searchResults.innerHTML = createSearchResults(results, searchInput);
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
