let usernameField = document.getElementById('username');
let passwordField = document.getElementById('password');
let confirmPasswordField = document.getElementById('confirmPassword');
let firstNameField = document.getElementById('firstName');
let lastNameField = document.getElementById('lastName');
let emailField = document.getElementById('email');
let registerForm = document.getElementById('registerForm');

let loginUsername = document.getElementById('loginUsername');
let loginPasswordField = document.getElementById('loginPassword');
let loginForm = document.getElementById('loginFormContainer');

let registerButton = document.getElementById('registerSubmit');
let loginButton = document.getElementById('loginSubmit');

let loginDiv = document.getElementById('login');
let registerDiv = document.getElementById('register');

// Workaround to get only send one request.
let hasSentRequest = false;

function register(event) {
    event.preventDefault();

    if(passwordField.value !== confirmPasswordField.value || passwordField.value === '' || confirmPasswordField.value === '') {
        alert("Passwords must match.");
        return;
    }

    let body = {
        username: usernameField.value,
        password: passwordField.value,
        firstName: firstNameField.value, 
        lastName: lastNameField.value, 
        email: emailField.value
    }

    if(hasSentRequest) alert('Please wait for request to complete.');

    if(!validateBody(body, true)) {
        alert('There was a problem with your request.')
        return;
    }

    axios.post('/api/register', body).then(res => {
        console.log(res);
        alert('Account has been created.');
        hasSentRequest = false;
    })
    .catch(err => {
        console.log(err)
        hasSentRequest = false;
    });
}

function login(event) {
    event.preventDefault();

    let body = {
        username: loginUsername.value,
        password: loginPasswordField.value
    }

    if(hasSentRequest) alert('Please wait for request to complete.');

    if(!validateBody(body, false)) {
        alert('There is a problem.');
        return;
    }

    hasSentRequest = true;

    axios.post('/api/login', body).then(res => {
        alert('Login successful.');
        console.log(res.data);
        document.cookie = `username=${res.data.username};`
        document.cookie = `userid=${res.data.userID};`;
        hasSentRequest = false;

    }).catch(err => {
        console.log('Error logging in.');
        console.log(err.message)
        //TODO: Find out how to send a message without sending 200.
        hasSentRequest = false;
    })
}

function validateBody(body, checkPass) {
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

        if(key === 'password' && pass && checkPass) pass = checkPassword(body[key]);
    })
    return pass;
}

function tradeFields() {
    loginDiv.hidden = !loginDiv.hidden;
    registerDiv.hidden = !registerDiv.hidden;
}

registerForm.addEventListener('submit', register);
loginForm.addEventListener('submit', login);

// confirmPasswordField.addEventListener('change', () => {
//     if(confirmPasswordField.value != '' && passwordField.value != '') registerButton.disabled = false;
//     else registerButton.disabled = true;
// })


//#region Password Checker


const passwordRequirements  = {
    // Setting these variables to 0 will disable the check.
    minLength: 8,
    maxLength: 0,
    minSpecialCharacters: 0,
    minCapLetter: 0, 
    minLowercaseLetter: 0,
    minNumber: 1,
}

// Specials character arrays for requirement checking
let specialCharacters  = ['/', '[', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '-', '=', ']', '{', '}', ';', "'", ':', '"', '\\', '|', ",", ".", "<", ">", "?", "+"]
let capitalLetters  = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
let lowercaseLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

Object.keys(passwordRequirements).forEach(key => {
    // Double check max Length. Want to make sure it's not below the min requirement.
    if(key === 'maxLength') { 
        passwordRequirement = (passwordRequirements.maxLength < 0 || passwordRequirements.maxLength < passwordRequirements.minLength) ? 0:passwordRequirements.maxLength;
    }
    else {
        passwordRequirements[key] = (passwordRequirements[key] < 0) ? 0:passwordRequirements[key];
    }
})

console.log(passwordRequirements);

function checkPassword(input) {
    let passwordMeetsRequirements = true;
    
    // Finally check for Lord of the Rings fans. Those guys are weird.
    if(input.toUpperCase() === "LOTR" || input.toUpperCase() === "LORDOFTHETHERINGS" || input.toUpperCase() === "LORD OF THE RINGS")
    {
        // They just get an instant fail.
        passwordMeetsRequirements = false;
        console.log("Cannot be a Lord of the rings fan.");
        return;
    }

    // Check password min
    if(passwordRequirements.minLength > 0 && input.length < passwordRequirements.minLength) {
        console.log(`Password is shorter than ${passwordRequirements.minLength} characters in length.`);
        passwordMeetsRequirements = false;
    }  

    // Check password max
    if(passwordRequirements.maxLength > 0 && input.length > passwordRequirements.maxLength) {
        console.log(`Password is longer than ${passwordRequirements.maxLength} characters in length.`);
        passwordMeetsRequirements = false;
    }

    // TODO: code optimization.
    // Object.keys(passwordRequirements).forEach(requirement => {
    //     if(requirement.contains('Length')) console.log('Check length');
    //     else passwordRequirements[key] > 0 && !containsArrayCheck(input, )
    // })

    // Check special characters
    if(passwordRequirements.minSpecialCharacters > 0 && !containsArrayCheck(input, specialCharacters)) {
        console.log(`Password contains less than ${passwordRequirements.minSpecialCharacters} special characters.`);
        passwordMeetsRequirements = false;
    }

    // Check capitalization
    if(passwordRequirements.minCapLetter > 0 && !containsArrayCheck(input, capitalLetters)) {
        console.log(`Password contains less than ${passwordRequirements.minCapLetter} capital letters.`);
        passwordMeetsRequirements = false;
    }

    // Check ...lowercaseization?
    if(passwordRequirements.minLowercaseLetter > 0 && !containsArrayCheck(input, lowercaseLetters)) {
        console.log(`Password contains less than ${passwordRequirements.minLowercaseLetter} lowercase letters.`);
        passwordMeetsRequirements = false;
    }

    // Check min number?
    if(passwordRequirements.minNumber > 0 && !containsArrayCheck(input, numbers)) {
        console.log(`Password contains less than ${passwordRequirements.minNumber} numbers.`);
        passwordMeetsRequirements = false;
    }

    return passwordMeetsRequirements;
}

function containsArrayCheck(inputString, arrayToCompare)
{
    tokens = inputString.slice();
    specialSymbolsFound = [];

    containsCharactersFromArray = false;

    for(let i = 0; i < tokens.length; i++) {
        for(let j = 0; j < arrayToCompare.length; j++) {
            if(tokens[i] == arrayToCompare[j]) {
                specialSymbolsFound.push(tokens[i]);
            }
        }
    }
    
    if(specialSymbolsFound.length > 0) containsCharactersFromArray = true;

    return containsCharactersFromArray;
}

//#endregion