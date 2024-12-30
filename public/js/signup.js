const signUp = (name, email, password) => {

    const res = axios({
        method: 'POST',
        url: '',
        data: {
            name,
            email,
            password
        }
    });
    consol.log(res);
}


document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signUp(name, email, password);
});