const removePopup = function () {
  const filter = document.getElementById('filter');
  filter.remove();
};

const setRemovePopupListeners = function () {
  document.addEventListener('keydown', () => {
    if (event.key === 'Escape') {
      removePopup();
    }
  });
};

const createPopup = function (element) {
  const popup = document.createElement('div');
  popup.appendChild(element);
  return popup;
};

const displayPopup = function (element) {
  const filter = document.createElement('div');
  filter.classList.add('filter');
  filter.id = 'filter';
  const popup = element;
  filter.appendChild(popup);
  document.body.appendChild(filter);
  setRemovePopupListeners();
  event.stopPropagation();
};
