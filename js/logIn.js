/**
 * Initializes the start screen by changing the password icon and rendering the login button.
 * @function loadStartScreen
 */
function loadStartScreen() {
    changePasswordIcon();
    renderLogInBtn();
}

window.addEventListener('load', () => {
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', () => {
        window.history.pushState(null, '', window.location.href);
    });
});

let startScreenLogo = document.getElementById('startScreenLogo');
let startScreenLogoFixed = document.getElementById('startScreenLogoFixed');
let logInContent = document.getElementById('logInContent');
let startScreenContainer = document.getElementById('startScreenContainer');

document.addEventListener('DOMContentLoaded', function () {
    if (!sessionStorage.getItem("start-Animation")) {
        startScreenLogoFixed.classList.add('d-none');
        logInContent.style.animation = 'none';
        startLogInAnimation();
    } else {
        startScreenContainer.classList.add('d-none');
        startScreenLogo.classList.add('d-none');
    }
})

/**
 * Starts the login animation.
 * @function startLogInAnimation
 */
function startLogInAnimation() {
    let logoSlideTimeOut = setTimeout(slideToCorner, 300);
    let logoChangeTimeOut = setTimeout(changeLogo, 550);
    startScreenContainer.classList.add('changeBgColor');
    startScreenLogo.classList.remove('d-none');
    setTimeout(function () {
        startScreenContainer.classList.add('d-none');
        startScreenLogo.classList.add('d-none');
        startScreenLogoFixed.classList.remove('d-none');
    }, 1000);
    sessionStorage.setItem("start-Animation", JSON.stringify('animation'));
}

/**
 * Slides the start screen logo to the corner.
 * @function slideToCorner
 */
function slideToCorner() {
    document.getElementById('startScreenLogo').classList.add('slideToCorner');
}

/**
 * Changes the start screen logo.
 * @function changeLogo
 */
function changeLogo() {
    document.getElementById('startScreenLogo').src = '/assets/img/join_logo.png';
}

let logInMailInput = document.getElementById('logInMailInput');
let logInPasswordInput = document.getElementById('logInPasswordInput');
let logInCheckBox = document.getElementById('logInCheckBox');
let logInMessageBox = document.getElementById('logInMessageBox');

/**
 * Displays a login failure message and styles.
 * @function logInFailed
 */
function logInFailed() {
    logInMailInput.classList.add('formInputWrong');
    logInPasswordInput.classList.add('formInputWrong');
    logInMessageBox.innerHTML = 'Ups! Wrong Email or Password. Try again.';
}

/**
 * Clears the login failure message and styles.
 * @function logInIsCorrected
 */
function logInIsCorrected() {
    logInMailInput.classList.remove('formInputWrong');
    logInPasswordInput.classList.remove('formInputWrong');
    logInMessageBox.innerHTML = '';
}

/**
 * Changes the password icon based on input value.
 * @function changePasswordIcon
 */
function changePasswordIcon() {
    let passwordIcon = document.getElementById('passwordIcon');
    if (logInPasswordInput.value <= 0) {
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

/**
 * Toggles the visibility of the password input field.
 * @function showPassword
 */
function showPassword() {
    let passwordIcon = document.getElementById('passwordIcon');
    if (logInPasswordInput.type === "password") {
        logInPasswordInput.type = "text";
        passwordIcon.src = '/assets/icon/visibility.png';
        passwordIcon.classList.add('visibilityIcon');
    } else {
        logInPasswordInput.type = "password";
        passwordIcon.src = '/assets/icon/visibility_off.png';
        passwordIcon.classList.remove('visibilityIcon');
    }
}

/**
 * Renders the login button based on input values.
 * @function renderLogInBtn
 */
function renderLogInBtn() {
    let logInBtn = document.getElementById('logInBtn');
    if (logInMailInput.value <= 0 || logInPasswordInput.value <= 0) {
        logInBtn.disabled = true;
        logInBtn.classList.add('btn_disabled');
    } else {
        logInBtn.disabled = false;
        logInBtn.classList.remove('btn_disabled')
    }
}

/**
 * Sets login cookies if the "Remember me" checkbox is checked.
 * @function setLoginCookie
 * @param {string} email - The email to be saved in the cookie.
 * @param {string} password - The password to be saved in the cookie.
 */
function setLoginCookie(email, password) {
    if (logInCheckBox.checked) {
        document.cookie = `email=${email}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
        document.cookie = `password=${password}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    } else {
        document.cookie = 'email=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'password=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

}

/**
 * Fills the login form with values from cookies.
 * @function fillLoginForm
 */
function fillLoginForm() {
    let cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        let [name, value] = cookie.split('=');
        if (name === 'email') {
            logInMailInput.value = decodeURIComponent(value);
        } else if (name === 'password') {
            logInPasswordInput.value = decodeURIComponent(value);
            logInCheckBox.checked = true;
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    fillLoginForm();
});


let form       = document.getElementById('logInForm');
let emailInput = document.getElementById('logInMailInput');
let pwInput    = document.getElementById('logInPasswordInput');
let msgBox     = document.getElementById('logInMessageBox');

form.addEventListener('submit', async e => {
  e.preventDefault();   
  let email    = emailInput.value.trim();
  let password = pwInput.value;

  try {
    let res = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: email, password })
      });
    let data = await res.json();

    if (!res.ok) {
      msgBox.textContent = data.error || data.detail || 'Login fehlgeschlagen';
      msgBox.classList.add('error');
      return;
    }
    sessionStorage.setItem('token', data.token);
    window.location.href = 'board.html';

  } catch (err) {
    msgBox.textContent = 'Server‑Error: ' + err.message;
    msgBox.classList.add('error');
  }
});

document.getElementById('guestLoginBtn')
  .addEventListener('click', async () => {
    try {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('token')

      let resp = await fetch('http://localhost:8000/api/auth/guest-login/', {
        method: 'POST',          
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',     
      });

      if (!resp.ok) {
        let text = await resp.text();
        console.error('Guest‑Login Error', resp.status, text);
        alert(`Guest‑Login fehlgeschlagen (Status ${resp.status})`);
        return;
      }

      let { token } = await resp.json();
      localStorage.setItem('authToken', token);
      window.location.href = '/summary_user.html';
    } catch (err) {
      console.error('Network/CORS error', err);
      alert('Netzwerk‑ oder CORS‑Fehler beim Guest‑Login');
    }
  });
