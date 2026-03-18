import '../styles/style.scss';

const initApp = () => {
  const root = document.querySelector('#main');
  if (!root) return;
  root.addEventListener('click', () => {
    console.log('clicked');
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
