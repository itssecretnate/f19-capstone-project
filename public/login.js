let usernameField = document.getElementById('username');
let passwordField = document.getElementById('password');
let firstNameField = document.getElementById('firstName');
let lastNameField = document.getElementById('lastName');
let emailField = document.getElementById('email');
let registerForm = document.getElementById('registerForm');

let loginUsername = document.getElementById('loginUsername');
let loginPasswordField = document.getElementById('loginPassword');
let loginForm = document.getElementById('loginForm');

function register(event) {
    event.preventDefault();

    let body = {
        username: usernameField.value,
        password: passwordField.value,
        firstName: firstNameField.value, 
        lastName: lastNameField.value, 
        email: emailField.value
    }

    if(!validateBody(body)) {
        alert('There was a problem with your request.')
        return;
    }

    axios.post('/api/register', body).then(res => {
        console.log(res);
    })
    .catch(err => console.log(err));
}

function login(event) {
    event.preventDefault();

    let body = {
        username: loginUsername.value,
        password: loginPasswordField.value
    }

    if(!validateBody(body)) {
        alert('There is a problem with your username or password.');
        return;
    }

    axios.post('/api/login', body).then(res => {
        alert('LOGIN SUCCESSFUL!');
    }).catch(err => {
        console.log('Error logging in.');
        //TODO: Find out how to send a message without sending 200.
    })
}

function validateBody(body, bodyType) {
    let pass = true;
    Object.keys(body).forEach(key => {
        let variable = body[key].split(" ").join("");
        if(variable != body[key]) {
            console.log('Body contains a space in: ' + key);
            pass = false;
        }
        if(body[key] === '') {
            console.log(`${key} cannot be empty.`);
            pass = false;
        }
    })
    return pass;
}

registerForm.addEventListener('submit', register);
loginForm.addEventListener('submit', login);