const removePopup = function () {
  const filter = document.getElementById('filter');
  filter.remove();
};

const setRemovePopupListeners = function () {
  document.getElementById('filter').addEventListener('click', removePopup);
  document.getElementById('closeBtn').addEventListener('click', removePopup);
  if (event.key === 'Escape') {
    removePopup();
  }
};

const createPopup = function (element) {
  const popup = document.createElement('div');
  const closeBtn = document.createElement('i');
  closeBtn.id = 'closeBtn';
  popup.appendChild(closeBtn);
  popup.appendChild(element);
  return popup;
};

const displayPopup = function (element) {
  event.stopPropagation();
  const filter = document.createElement('div');
  filter.classList.add('filter');
  filter.id = 'filter';
  const popup = createPopup(element);
  filter.appendChild(popup);
  document.body.appendChild(filter);
};
