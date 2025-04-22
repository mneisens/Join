// /**
//  * Initializes the sign-up screen by rendering the sign-up button and changing password icons.
//  * @function loadSignUp
//  */
function loadSignUp() {
    renderSignUpBtn();
    changePasswordIcon();
    changeConfirmPasswordIcon();
}

let signUpNameInput = document.getElementById('signUpNameInput');
let signUpMailInput = document.getElementById('signUpMailInput');
let signUpPasswordInput = document.getElementById('signUpPasswordInput');
let signUpConfirmPasswordInput = document.getElementById('signUpConfirmPasswordInput');
let signUpCheckBox = document.getElementById('signUpCheckBox');
let signUpForm = document.getElementById('signUpForm');
let signUpContainer = document.getElementById('signUpContainer');

// /**
//  * Changes the password icon based on input value for the password field.
//  * @function changePasswordIcon
//  */
function changePasswordIcon() {
    let passwordIcon = document.getElementById('passwordIcon');
    if (signUpPasswordInput.value <= 0) {
        passwordIcon.src = '/assets/icon/lock.png';
        passwordIcon.classList.remove('noVisibilityIcon');
        passwordIcon.classList.remove('visibilityIcon');
        passwordIcon.classList.add('img_diabled');
    } else {
        passwordIcon.src = '/assets/icon/visibility_off.png';
        passwordIcon.classList.add('noVisibilityIcon');
        passwordIcon.classList.remove('img_diabled');
    }
}

// /**
//  * Changes the password icon based on input value for the confirm password field.
//  * @function changeConfirmPasswordIcon
//  */
function changeConfirmPasswordIcon() {
    let confirmPasswordIcon = document.getElementById('confirmPasswordIcon');
    if (signUpConfirmPasswordInput.value <= 0) {
        confirmPasswordIcon.src = '/assets/icon/lock.png';
        confirmPasswordIcon.classList.remove('noVisibilityIcon');
        confirmPasswordIcon.classList.remove('visibilityIcon');
        confirmPasswordIcon.classList.add('img_diabled');
    } else {
        confirmPasswordIcon.src = '/assets/icon/visibility_off.png';
        confirmPasswordIcon.classList.add('noVisibilityIcon');
        confirmPasswordIcon.classList.remove('img_diabled');
    }
}

// /**
//  * Toggles the visibility of the password input field.
//  * @function showPassword
//  */
function showPassword() {
    let passwordIcon = document.getElementById('passwordIcon');
    if (signUpPasswordInput.type === "password") {
        signUpPasswordInput.type = "text";
        passwordIcon.src = '/assets/icon/visibility.png';
        passwordIcon.classList.add('visibilityIcon');
    } else {
        signUpPasswordInput.type = "password";
        passwordIcon.src = '/assets/icon/visibility_off.png';
        passwordIcon.classList.remove('visibilityIcon');
    }
}

// /**
//  * Toggles the visibility of the confirm password input field.
//  * @function showConfirmPassword
//  */
function showConfirmPassword() {
    let confirmPasswordIcon = document.getElementById('confirmPasswordIcon');
    if (signUpConfirmPasswordInput.type === "password") {
        signUpConfirmPasswordInput.type = "text";
        confirmPasswordIcon.src = '/assets/icon/visibility.png';
        confirmPasswordIcon.classList.add('visibilityIcon');
    } else {
        signUpConfirmPasswordInput.type = "password";
        confirmPasswordIcon.src = '/assets/icon/visibility_off.png';
        confirmPasswordIcon.classList.remove('visibilityIcon');
    }
}

// /**
//  * Renders the sign-up button based on input values.
//  * @function renderSignUpBtn
//  */
function renderSignUpBtn() {
    let signUpBtn = document.getElementById('signUpBtn');
    if (signUpNameInput.value <= 0 || signUpMailInput.value <= 0
        || signUpPasswordInput.value <= 0 || signUpConfirmPasswordInput.value <= 0
        || !signUpCheckBox.checked) {
        signUpBtn.disabled = true;
        signUpBtn.classList.add('btn_disabled');
    } else {
        signUpBtn.disabled = false;
        signUpBtn.classList.remove('btn_disabled')
    }
}

// /**
//  * Displays a password mismatch error message and styles.
//  * @function wrongPassword
//  */
function wrongPassword() {
    let signUpMessageBox = document.getElementById('signUpMessageBox');
    let wrongMessage = 'Ups! your password don,t match.';
    signUpMessageBox.innerHTML = wrongMessage.replace(',', '`');
    signUpConfirmPasswordInput.classList.add('formInputWrong');
}

// /**
//  * Clears the password mismatch error message and styles if passwords match.
//  * @function passwordIsCorrected
//  */
function passwordIsCorrected() {
    if (signUpPasswordInput.value == signUpConfirmPasswordInput.value) {
        signUpConfirmPasswordInput.classList.remove('formInputWrong');
        signUpMessageBox.innerHTML = '';
    }
}

// /**
//  * Displays a successful sign-up message and navigates to the login page.
//  * @function signedUpSuccessfully
//  */
function signedUpSuccessfully() {
    document.getElementById('signedUpBtn').classList.add('signedUpBtnSlide');
    let toLogIn = setTimeout(navToLogIn, 1750);
}

// /**
//  * Navigates to the login page with a success message.
//  * @function navToLogIn
//  */
function navToLogIn() {
    window.location.href = 'log_in.html?msg=You Signed Up successfully.';
}

let form       = document.getElementById('signUpForm');
let nameInput  = document.getElementById('signUpNameInput');
let emailInput = document.getElementById('signUpMailInput');
let pwInput    = document.getElementById('signUpPasswordInput');
let msgBox     = document.getElementById('signUpMessageBox');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  let username = emailInput.value.trim();      
  let password = pwInput.value;
  let name     = nameInput.value.trim();       

  try {
    let res = await fetch('http://127.0.0.1:8000/api/auth/register/', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username, password })
    });

    let data = await res.json();

    if (!res.ok) {
      msgBox.textContent = data.error || data.detail || 'Registrierung fehlgeschlagen';
      msgBox.classList.add('error');
      return;
    }

    sessionStorage.setItem('token', data.token);

    window.location.href = 'log_in.html?msg=Erfolgreich registriert!';

  } catch (err) {
    msgBox.textContent = 'Netzwerk‑Fehler: ' + err.message;
    msgBox.classList.add('error');
  }
});
