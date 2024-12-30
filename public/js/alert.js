export const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
  };
  
  // type is 'success' or 'error', duration defaults to 5000ms
  export const showAlert = (type, msg, duration = 5000) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}" role="alert" aria-live="assertive">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, duration);
  };
  