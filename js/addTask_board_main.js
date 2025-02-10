/**
 * Loads and initializes the "Add Task" page components.
 * @async
 */
async function loadAddTasks() {
    await includeHTML();
    createUserInitials();
    aktiveLink();
  }
  
  let currentContactId = null;
  let kanbanCategory = "Todo";
  
  /**
   * Firebase configuration object.
   */
  const firebaseConfig = {
    apiKey: "AIzaSyBrslTwOvrS4_tnF6uODjT1KQuWR4ttzFY",
    authDomain: "join193-5ae20.firebaseapp.com",
    databaseURL:
      "https://join193-5ae20-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "join193-5ae20",
    storageBucket: "join193-5ae20.appspot.com",
    messagingSenderId: "330884835484",
    appId: "1:330884835484:web:20d71dc457ab9659d0a559",
  };
  
  firebase.initializeApp(firebaseConfig);
  
  /**
   * Sets up event listeners for the document once the DOM is fully loaded.
   */
  document.addEventListener("DOMContentLoaded", () => {
    setupFormListener();
    setupPriorityButtons();
    setupAssignedTaskButton();
    setMinDateForCalendar();
    loadCategories();
    updateSelectedAbbreviations();
  });
  
  /**
   * Sets up the form listener for form submission.
   */
  function setupFormListener() {
    let form = document.getElementById("myForm");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        alert("Bitte alle Felder ausfüllen.");
      } else {
        submitContact();
      }
    });
  }
  
  /**
   * Formats a date string from "YYYY-MM-DD" to "DD/MM/YYYY".
   * @param {string} dateStr - The date string in "YYYY-MM-DD" format.
   * @returns {string} The formatted date string in "DD/MM/YYYY" format.
   */
  function formatDate(dateStr) {
    let [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }
  
  /**
   * Collects data from the form.
   * @returns {Object} The collected form data.
   */
  function getTaskListItems() {
    const ulTasks = document.getElementById("addedTasks");
    const lisTasks = ulTasks.querySelectorAll("li");
    return Array.from(lisTasks).map(li => ({
      subtask: encodeHTML(
        li.querySelector(".subtask-text")
          .textContent.replace(/^\•\s*/, "")
          .trim()
      ),
      done: false
    }));
  }
  
  /**
   * Retrieves data from checked category checkboxes.
   * @returns {Array<Object>} An array of objects containing the name, color, initials, and id of each checked category.
   */
  function getCheckedCategories() {
    const checkboxes = document.querySelectorAll(".category-checkbox");
    return Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => ({
      name: checkbox.dataset.name,
      color: checkbox.dataset.color,
      initials: checkbox.dataset.initials,
      id: checkbox.dataset.id
    }));
  }
  
  /**
   * Retrieves the active priority level.
   * @returns {string} The id of the active priority button or "low" if no button is active.
   */
  function getActivePriority() {
    return document.querySelector(".prio-addTask button.active")?.id || "low";
  }
  
  /**
   * Encodes HTML entities in the header and description input fields.
   * @returns {Object} An object containing the encoded header and description.
   */
  function getHeaderAndDescription() {
    return {
      header: encodeHTML(document.getElementById("input-title-addTask").value),
      description: encodeHTML(document.getElementById("textarea-addTask").value),
    };
  }
  
  /**
   * Retrieves category abbreviations from the UI.
   * @returns {Array<string>} An array of category abbreviation strings.
   */
  function getCategoryAbbreviations() {
    const abbreviationsContainer = document.getElementById("showName");
    const badges = abbreviationsContainer.querySelectorAll(".abbreviation-badge");
    return Array.from(badges).map(badge => badge.textContent);
  }
  
  /**
   * Assembles all parts of the form data into a single object.
   * @returns {Object} The assembled form data object.
   */
  function assembleData() {
    const { header, description } = getHeaderAndDescription();
    return {
      header,
      description,
      dueDate: formatDate(document.getElementById("date-addTask").value),
      priority: getActivePriority(),
      category: document.getElementById("category").value,
      subtasks: getTaskListItems(),
      categoryAbbreviations: getCategoryAbbreviations(),
      assignedTo: getCheckedCategories(),
      kanbanCategory: kanbanCategory, 
    };
  }
  
  /**
   * Collects and returns the form data.
   * @returns {Object} The form data object.
   */
  function collectFormData() {
    return assembleData();
  }
  
  /**
   * Encodes a string to HTML entities.
   * @param {string} str - The string to be encoded.
   * @returns {string} The encoded string.
   */
  function encodeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  
  /**
   * Submits the contact form data to Firestore.
   */
  function submitContact() {
    let db = firebase.firestore();
    let data = collectFormData();
    let contactsCollection = db.collection("UserAuthList").doc(userCreds.uid).collection("addTasks");
  
    if (currentContactId) {
      updateContact(contactsCollection, data);
    } else {
      addNewContact(contactsCollection, data);
    }
  }
  
  /**
   * Updates an existing contact in Firestore.
   * @param {firebase.firestore.CollectionReference} contactsCollection - The Firestore collection reference.
   * @param {Object} data - The data to update in the contact document.
   */
  function updateContact(contactsCollection, data) {
    contactsCollection.doc(currentContactId).set(data, { merge: true }).then(() => {
        showSuccessMessage();
      })
      .catch((error) => console.error("Fehler beim Aktualisieren des Dokuments: ", error));
  }
  
  /**
   * Adds a new contact to Firestore.
   * @param {firebase.firestore.CollectionReference} contactsCollection - The Firestore collection reference.
   * @param {Object} data - The data to add to the new contact document.
   */
  function addNewContact(contactsCollection, data) {
    contactsCollection.add(data).then((docRef) => {
        setTaskIdInDocument(contactsCollection, docRef.id, data);
      })
      .catch((error) => console.error("Fehler beim Hinzufügen des Dokuments: ", error));
  }
  
  /**
   * Sets the task ID in the newly added contact document.
   * @param {firebase.firestore.CollectionReference} contactsCollection - The Firestore collection reference.
   * @param {string} taskId - The ID of the newly added contact document.
   * @param {Object} data - The data to add to the new contact document.
   */
  function setTaskIdInDocument(contactsCollection, taskId, data) {
    contactsCollection.doc(taskId).set({ taskId: taskId }, { merge: true }).then(() => {
        showSuccessMessage();
        addTaskToBoardWithoutLoadNew(taskId, data);
        hideAddTaskBg();
      })
      .catch((error) => console.error("Fehler beim Aktualisieren der ID des Dokuments: ", error));
  }
  
  
  function showSuccessMessage() {
    let successContainer = document.getElementById("contact-succesfully-created");
    successContainer.style.display = "flex";
  }
  
  /**
   * This function used to refresh the boardTask Array needed for later use, cause the board.html will not
   * be reload. For better user experience this function only add the new TaskCard to the kanbanBoard,
   * and hide the addTask menu.
   * @param {string} id - the id of document in firebase wich was created before
   * @param {JSON} task - the current added task as a json
   */
  function addTaskToBoardWithoutLoadNew(id, task) {
    Object.assign(task, { taskId: `${id}` });
    const taskConfig = returnConfigBoardCardHtml(task);
    let category = task.kanbanCategory;
  
    let sortetTasks = boardTasks.filter((b) => b["kanbanCategory"] == category);
    if (sortetTasks.length === 0) {
      hideNoTasksToDoBox(category);
    }
  
    let htmlAssignedTo = renderHtmlBoardPreviewCardProfileBadge(task);
    document.getElementById(`boardCardsContainer${category}`).innerHTML +=
      returnHtmlBoardTaskPreviewCard(task, taskConfig, htmlAssignedTo);
    boardTasks.push(task);
  }
  
  /**
   * This function used to hide the addTask window.
   */
  function hideAddTaskBg() {
    setTimeout(() => {
      document.getElementById("boardAddTaskMainBg").classList.add("d-none");
      document.getElementById("contact-succesfully-created").style.display =
        "none";
      resetForm();
    }, 2000);
  }
  
  /**
   * This function used to hide the 'no-task-card' if user add the first task to kanban category.
   * 
   * @param {string} category - current kanban category
   */
  function hideNoTasksToDoBox(category){
   let element =  document.getElementById(`boardCardsContainer${category}`);
   element.querySelector('.board-no-tasks-toDo-box').classList.add('d-none');
  }
  
  /**
   * Sets up event listeners for priority buttons.
   */
  function setupPriorityButtons() {
    let buttons = document.querySelectorAll(".prio-addTask button");
    buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        setButtonValues(button);
      });
    });
  }
  
  /**
   * Sets the values and active states for priority buttons.
   * @param {HTMLElement} clickedButton - The clicked button element.
   */
  function setButtonValues(clickedButton) {
    let buttons = document.querySelectorAll(".prio-addTask button");
    buttons.forEach((button) => {
      button.setAttribute("value", button === clickedButton ? "true" : "false");
      button.classList.toggle("active", button === clickedButton);
    });
    updateButtonColors();
  }
  
  
  /**
   * Updates the colors of the priority buttons.
   */
  function updateButtonColors() {
    let urgent = document.getElementById("urgent");
    let medium = document.getElementById("medium");
    let low = document.getElementById("low");
    updateButtonColor(
      urgent, "rgba(255, 61, 0, 1)", "prio-up-orange", "prio-up-white");
    updateButtonColor(medium, "rgba(255, 168,0, 1)", "prio-medium-ye", "prio-medium-white");
    updateButtonColor( low, "rgba(122, 226, 41, 1)","prio-down-green", "prio-down-white");
  }
  
  /**
   * Updates the color of a priority button based on its active state.
   * @param {HTMLElement} button - The button element.
   * @param {string} color - The color to apply when active.
   * @param {string} iconDefault - The default icon element ID.
   * @param {string} iconActive - The active icon element ID.
   */
  function updateButtonColor(button, color, iconDefault, iconActive) {
    let isActive = button.getAttribute("value") === "true";
    button.style.backgroundColor = isActive ? color : "";
    document.getElementById(iconDefault).classList.toggle("d-none", isActive);
    document.getElementById(iconActive).classList.toggle("d-none", !isActive);
    button.classList.toggle("btn-font", isActive);
  }
  
  /**
   * Sets up the assigned task button to toggle the options container.
   */
  function setupAssignedTaskButton() {
    let assignedAddTaskButton = document.getElementById("assigned-addTask");
    let optionsContainer = document.getElementById("optionsContainer");
    assignedAddTaskButton.addEventListener("click", (event) => {
      toggleOptionsContainer(event, optionsContainer);
    });
    document.addEventListener("click", (event) => {
      hideOptionsContainer(event, optionsContainer, assignedAddTaskButton);
    });
    optionsContainer.addEventListener("click", (event) =>
      event.stopPropagation()
    );
  }
  
  /**
   * Toggles the display of the options container.
   * @param {MouseEvent} event - The click event.
   * @param {HTMLElement} optionsContainer - The options container element.
   */
  function toggleOptionsContainer(event, optionsContainer) {
    event.stopPropagation();
    if (optionsContainer.style.display === "none") {
      optionsContainer.style.display = "flex";
      document.getElementById("selectedCategory").style.border = "1px solid #29ABE2";
      document.getElementById("selectedCategoryIcon").src = "assets/symbols/Property 1=Variant4.svg";
    } else {
      optionsContainer.style.display = "none";
      document.getElementById("selectedCategory").style.border = "1px solid #D1D1D1";
      document.getElementById("selectedCategoryIcon").src =  "assets/symbols/arrow_drop_downaa.svg";
    }
  }
  
  /**
   * Hides the options container if clicked outside.
   * @param {MouseEvent} event - The click event.
   * @param {HTMLElement} optionsContainer - The options container element.
   * @param {HTMLElement} assignedAddTaskButton - The assigned task button element.
   */
  function hideOptionsContainer(event, optionsContainer, assignedAddTaskButton) {
    if (
      optionsContainer.style.display !== "none" &&
      !optionsContainer.contains(event.target) &&
      event.target !== assignedAddTaskButton
    ) {
      document.getElementById("selectedCategory").style.border =
        "1px solid #D1D1D1";
      optionsContainer.style.display = "none";
    }
  }
  
  /**
   * Loads categories from Firestore and creates options in the container.
   */
  function loadCategories() {
    let db = firebase.firestore();
    let optionsContainer = document.getElementById("optionsContainer");
    optionsContainer.innerHTML = "";
    db.collection("UserAuthList") .doc(userCreds.uid).collection("contacts").orderBy("name").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => createCategoryOption(doc.data(), optionsContainer));
      }).catch((error) => console.error("Error getting documents: ", error));
  }
  
  /**
   * Creates a category option element and appends it to the container.
   * @param {Object} category - The category data.
   * @param {string} category.name - The name of the category.
   * @param {string} category.color - The color associated with the category.
   */
  function createCategoryOption(category, optionsContainer) {
    let optionDiv = document.createElement("div");
    optionDiv.id = category.id;
    optionDiv.className = "option";
    optionDiv.style.cssText = `display: flex; align-items: center; justify-content: space-between; padding: 5px; box-sizing: border-box;`;
    optionDiv.innerHTML = createCategoryOptionHTML(category);
  
    optionDiv.addEventListener("click", (event) => {
      let checkbox = optionDiv.querySelector(".category-checkbox");
      if (event.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        updateSelectedAbbreviations();
        optionDiv.classList.toggle("active", checkbox.checked);
      }
    });
    optionsContainer.appendChild(optionDiv);
  }