import '@babel/polyfill';
import { login, logout} from './login';


const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');


// LOGIN FORM SUBMISSION
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!email || !password) {
      console.error('Email and password are required');
      return;
    }
    login(email, password);
  });
}

if(logOutBtn) logOutBtn.addEventListener('click', logout);

