let summaryTasks = [];

/**
 * Loads the summary user information and initial data required for the summary page.
 * This includes HTML includes, login checks, rendering SVGs, and loading tasks from the database.
 */
async function loadSummaryUser() {
  await includeHTML();
  activeLink(1, window.location.href);
  renderSummarySvg();
  await sumFinalLoadDataFromBackend();
  showGreeting();
  ensureUIIsInteractive(); 
}

function showGreeting() {
  let greeting = returnGreeting();
  greetUserDesktopContainer.innerHTML = createDesktopGreeting(greeting);
  
  if (window.innerWidth <= 1010) {
    greetUserDesktopContainer.innerHTML += createMobilGreeting(greeting);
  }
}

function ensureUIIsInteractive() {
  let createMyContactContainer = document.getElementById('createMyContactContainer');
  if (createMyContactContainer) {
    createMyContactContainer.style.display = 'none';
  }
  
  let overlays = document.querySelectorAll('.popUpContainer, .modal-overlay, .overlay');
  overlays.forEach(overlay => {
    overlay.style.display = 'none';
  });
  
  document.body.style.pointerEvents = 'auto';
  document.body.style.opacity = '1';
}

async function sumFinalLoadDataFromBackend() {
  try {
    let apiUrl = 'http://localhost:8000/api';
    let options = getRequestOptions('GET');
    let response = await fetch(`${apiUrl}/tasks/`, options);
    
    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der Tasks');
    }
    let allTasks = await response.json();
    summaryTasks = allTasks.map(task => {
      let dueDate = "";
      if (task.due_date) {
        let [year, month, day] = task.due_date.split("-");
        dueDate = `${day}/${month}/${year}`;
      }

      return {
        taskId: task.id,
        header: task.header || "",
        description: task.description || "",
        dueDate: dueDate,
        priority: task.priority || "low",
        category: task.category || "User Story",
        kanbanCategory: task.kanban_category || "Todo",
      };
    });

    if (summaryTasks.length > 0) {
      rednerSummaryInfo();
      renderDeadline();
    } else {
    }
  } catch (error) {
  }
}

/**
 * Loads tasks from the database and updates the summary information on the page.
 * If tasks are available, renders the summary information and deadlines.
 */
async function sumFinalLoadDataFromDatabase() {
  summaryTasks = await loadTasks();
  if (Array.isArray(summaryTasks) && summaryTasks.length > 0) {
    rednerSummaryInfo();
    renderDeadline();
  } else {
  }
}

/**
 * Renders SVG elements to the summary page.
 * This function is necessary due to issues with including pure SVG code using the w3-include method.
 */
function renderSummarySvg() {
  document.getElementById("sumCardTodoIcon").innerHTML =
    returnHtmlSvgTodoIcon();
  document.getElementById("sumCardDoneIcon").innerHTML =
    returnHtmlSvgDoneIcon();
}

/**
 * Renders summary information about tasks including count of tasks in various categories.
 * Updates the summary cards with the count of tasks in each category.
 */
function rednerSummaryInfo() {
  let taskCounts = summaryTasks.reduce(
    (counts, task) => {
      counts.allTasks++;
      if (task.kanbanCategory === "Todo") counts.todoTasks++;
      if (task.kanbanCategory === "Done") counts.doneTasks++;
      if (task.kanbanCategory === "InProgress") counts.inProgressTasks++;
      if (task.kanbanCategory === "AwaitFeedback") counts.awaitingTasks++;
      if (task.priority === "urgent") {
        counts.urgentTasks++;
        if (task.kanbanCategory === "Done") {
          counts.urgentTasks--;
        }
      }
      return counts;
    },
    {
      todoTasks: 0,
      doneTasks: 0,
      urgentTasks: 0,
      allTasks: 0,
      inProgressTasks: 0,
      awaitingTasks: 0,
    }
  );

  document.getElementById("sumCardTodoInt").innerHTML = taskCounts.todoTasks;
  document.getElementById("sumCardDoneInt").innerHTML = taskCounts.doneTasks;
  document.getElementById("sumCardUrgentInt").innerHTML =
    taskCounts.urgentTasks;
  document.getElementById("sumCardAmountInt").innerHTML = taskCounts.allTasks;
  document.getElementById("sumCardInProgressInt").innerHTML =
    taskCounts.inProgressTasks;
  document.getElementById("sumCardAwaitInt").innerHTML =
    taskCounts.awaitingTasks;
}

let urgentTasksDeadline = [];

/**
 * Renders deadlines for urgent tasks.
 * Finds urgent tasks that are not done and sorts them by their due date.
 */
function renderDeadline() {
  for (let i = 0; i < summaryTasks.length; i++) {
    let summaryTask = summaryTasks[i];
    let taskDeadline = summaryTask.dueDate;
    let taskPriotity = summaryTask.priority;
    let taskKanbanCategory = summaryTask.kanbanCategory;
    if (taskPriotity === 'urgent' && taskKanbanCategory !== "Done") {
      urgentTasksDeadline.push(taskDeadline);
    }
  }
  if (urgentTasksDeadline.length > 0) {
    sortUrgentTasksDeadline();
  }
}

let monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Sorts urgent tasks by their deadline and updates the page with the nearest deadline.
 */
function sortUrgentTasksDeadline() {
  urgentTasksDeadline = urgentTasksDeadline.map(dateString => {
    let parts = dateString.split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]);
  });

  urgentTasksDeadline.sort(function (a, b) {
    return a - b;
  });

  let firstUrgentDate = urgentTasksDeadline[0];
  let formatedFirstUrgentDate = monthNames[firstUrgentDate.getMonth()] + " " + firstUrgentDate.getDate() + ", " + firstUrgentDate.getFullYear();

  document.getElementById('deadlineDatum').innerHTML = formatedFirstUrgentDate;
  document.getElementById('deadlineText').innerHTML = 'Upcoming Deadline';
  deadlineAlert(firstUrgentDate);
}

/**
 * Checks if the nearest deadline is today and if so, adds a blinking alert.
 * @param {Date} firstUrgentDate - The nearest urgent task deadline.
 */
function deadlineAlert(firstUrgentDate) {
  let currentDate = new Date();
  if (currentDate.getFullYear() === firstUrgentDate.getFullYear() &&
    currentDate.getMonth() === firstUrgentDate.getMonth() &&
    currentDate.getDate() === firstUrgentDate.getDate()) {
    document.getElementById('urgentTaskContainer').classList.add('blink');
  }
}

let greetUserDesktopContainer = document.getElementById('greetUserDesktopContainer');

/**
 * Checks if the greeting animation should be shown and renders the mobile greeting if appropriate.
 */
function checkAnimation() {
  let greeting = returnGreeting();
  if (sessionStorage.getItem("greet-Animation")) {
    if (window.innerWidth <= 1010) {
      greetUserDesktopContainer.innerHTML += createMobilGreeting(greeting);
    }
  }
  let removeGreetAnimation = setTimeout(removeAnimation, 1200)
}

/**
 * Renders the desktop greeting for the user.
 */
function showDesktopGreeting() {
  let greeting = returnGreeting();
  greetUserDesktopContainer.innerHTML = '';
  greetUserDesktopContainer.innerHTML = createDesktopGreeting(greeting);
}

/**
 * Returns a greeting based on the current time of day.
 * @returns {string} The appropriate greeting for the current time of day.
 */
function returnGreeting() {
  let now = new Date();
  let hours = now.getHours();
  let greeting = '';

  if (hours < 12) {
    greeting = "Good Morning,";
  } else if (hours < 18) {
    greeting = "Welcome to Join,";
  } else {
    greeting = "Good Evening,";
  }
  return greeting;
}

function getStoredUserInfo() {
  let raw = sessionStorage.getItem('user-info') || '{"name":""}';
  return JSON.parse(raw);
}

function createDesktopGreeting(greeting) {
  let userInfo = getStoredUserInfo();
  return `
    <div class="sum-content-greeting-desktop-div">
      <p class="greetText">${greeting}</p>
      <p class="greetUser">${userInfo.name}</p>
    </div>`;
}

function createMobilGreeting(greeting) {
  let userInfo = getStoredUserInfo();
  return `
    <div class="sum-content-greeting-div greetAnimation">
      <p class="greetText">${greeting}</p>
      <p class="greetUser">${userInfo.name}</p>
    </div>`;
}
/**
 * Removes the greeting animation from session storage.
 */
function removeAnimation() {
  sessionStorage.removeItem("greet-Animation");
}

/**
 * Creates the HTML for the "Create My Contacts" popup.
 * @returns {string} The HTML for the "Create My Contacts" popup.
 */
function createMyContactsPopUp() {
  return `<div id="createMyContact" class="popUp slideInBottom">
  <div class="popUpHeader">
      <img src="/assets/img/join_mobil_logo.png" class="popUpLogo">
      <div class="popUpHeadline">Welcome</div>
      <div class="popUpText">Please create your Contact!</div>
      <div class="popUpDistacer"></div>
  </div>
  <div class="popUpContent">
      <div class="popUpInitial">
          <div class="popUpInitialContainer">
            <div class="popUpInitials" id="first"></div>
            <div class="popUpInitials" id="second"></div>
          </div>
      </div>
<form id="createMyContactForm" class="popUpForm" onsubmit="startCreateMyContact(); return false;" onkeyup="renderCreateMyContactBtn()">
  <div class="formInputContainer">
      <input required type="text" placeholder="Name" id="createMyContactNameInput" class="formInput" value="${userInfo.name}" onkeyup="createMyContactInitials()">
      <img src="/assets/icon/person.png" alt="person" class="personIcon">
  </div>
  <div class="formInputContainer">
      <input required type="email" placeholder="Email" id="createMyContactEmailInput" class="formInput" value="${userInfo.email}">
      <img src="/assets/icon/mail.png" alt="mail" class="mailIcon">
  </div>
  <div class="formInputContainer">
      <input required type="text" placeholder="Phone" id="createMyContactPhoneInput" class="formInput" oninput="this.value = this.value.replace(/[^0-9.]/g, '');">
      <img src="/assets/img/contacts/call.png" alt="phone" class="phoneIcon">
  </div>
  <div class="popUpBtnContainer">
    <button id="createMyContactBtn" class="popUpBtn" type="submit">Create contact<img src="/assets/img/addTask/check.png"></button>                     
  </div>
</form>
  </div>
</div>`;
}

/**
 * Initiates the process to create a new contact.
 * Updates account data, hides the popup, adds the contact, updates the first login status, and shows greetings.
 */
async function startCreateMyContact() {
  await updateAccountData();
  hideCreateMyContactPopUp();
  addMyContact();
  updateFirstLogIn();
  checkAnimation();
  showDesktopGreeting();
}

/**
 * Enables or disables the "Create My Contact" button based on the input fields' values.
 */
function renderCreateMyContactBtn() {
  let createMyContactNameInput = document.getElementById('createMyContactNameInput');
  let createMyContactEmailInput = document.getElementById('createMyContactEmailInput');
  let createMyContactPhoneInput = document.getElementById('createMyContactPhoneInput');
  let createMyContactBtn = document.getElementById('createMyContactBtn');
  if (createMyContactNameInput.value.length <= 0 || createMyContactEmailInput.value.length <= 0 || createMyContactPhoneInput.value.length <= 0) {
    createMyContactBtn.disabled = true;
    createMyContactBtn.classList.add('btn_disabled');
  } else {
    createMyContactBtn.disabled = false;
    createMyContactBtn.classList.remove('btn_disabled');
  }
}

/**
 * Hides the "Create My Contact" popup with an animation.
 */
function hideCreateMyContactPopUp() {
  let createMyContactContainer = document.getElementById('createMyContactContainer');
  let createMyContact = document.getElementById('createMyContact');
  createMyContact.classList.remove('slideInBottom');
  createMyContact.classList.add('slideOutBottom');
  setTimeout(function () {
    createMyContactContainer.classList.add('d-none');
  }, 500);
}

/**
 * Retrieves the name from the "Create My Contact" input field.
 * @returns {string} The name entered in the input field.
 */
function getNameFromInput() {
  return document.getElementById('createMyContactNameInput').value;
}

/**
 * Retrieves the email from the "Create My Contact" input field.
 * @returns {string} The email entered in the input field.
 */
function getEmailFromInput() {
  return document.getElementById('createMyContactEmailInput').value;
}

/**
 * Retrieves the phone number from the "Create My Contact" input field.
 * @returns {string} The phone number entered in the input field.
 */
function getPhoneFromInput() {
  return document.getElementById('createMyContactPhoneInput').value;
}