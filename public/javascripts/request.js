const post = function (url, postData, callback) {
  const requestOptions = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(postData),
  };
  return fetch(url, requestOptions)
    .then(response => response.json())
    .then(callback);
};
