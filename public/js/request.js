const get = function (url) {
  return fetch(url, { method: 'GET' });
};

const post = function (url, postData) {
  const requestOptions = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(postData),
  };
  return fetch(url, requestOptions);
};
