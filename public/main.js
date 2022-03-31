// Used for shared functionality on sites. Such as handling cookie data.

let welcomeUserField = document.getElementById('welcomeUserField');
let username = '';
let userID;

// Jank cookie deconstruction.

let cookieData = document.cookie.split('; ');

cookieData.forEach(cookie => {
    let temp = cookie.split('=')
    if(temp[0] === 'username') username = temp[1];
    else if(temp[0] === 'userid') userID = +temp[1];
})

welcomeUserField.innerText = (username != '') ? `Welcome: ${username} || UserID: ${userID}` : '';