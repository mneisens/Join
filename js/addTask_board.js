/**
 * Adds a subtask to the list.
 */
function addSubtask() {
  let inputField = document.getElementById("input-title-addTasks");
  let subtaskText = inputField.value.trim();
  if (subtaskText === "") return;
  let ul = document.getElementById("addedTasks");
  if (window.addTaskInEditMode || window.editTaskId) {
    addSubtaskInEditMode();
  } else {
    ul.appendChild(createSubtaskElement(subtaskText));
  }
  inputField.value = "";
}

function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Create Subtask for a new task
 */
function createSubtaskElement(subtask) {
  subtask = escapeHTML(subtask);
  let li = document.createElement("li");
  li.className = "one-subtask";
  li.innerHTML = `
        <span class="subtask-text">• ${subtask}</span>
        <div class="subtask-icons">
            <img src="/assets/img/contacts/edit.png" alt="Bearbeiten" class="edit-icon">
            <img src="/assets/img/contacts/delete.png" alt="Löschen" class="delete-icon">
        </div>
    `;
  return li;
}

document.getElementById("addedTasks").addEventListener("click", (event) => handleSubtaskActions(event));

/**
 * Handles subtask edit and delete actions.
 * @param {MouseEvent} event - The click event.
 */
function handleSubtaskActions(event) {
  let currentTaskId = editTaskId || window.editTaskId;
  let li = event.target.closest("li");
  if (
    event.target.classList.contains("delete-icon") ||
    event.target.classList.contains("clear-icon")
  ) {
    let subtaskId = li.id || '';
    if (addTaskInEditMode && typeof editTaskChangeSubtask === 'function') {
      event.stopPropagation();
      editTaskChangeSubtask(subtaskId, "delete", "");
    }
    li.remove();    
  } else if (event.target.classList.contains("edit-icon")) {
    editSubtask(li);
  }
  
  if (!editTaskId && currentTaskId) {
    editTaskId = currentTaskId;
    window.editTaskId = currentTaskId;
  }
}

/**
 * Edits a subtask.
 * @param {HTMLElement} li - The subtask list item element.
 */
function editSubtask(li) {
  let span = li.querySelector(".subtask-text");
  if (li.querySelector(".edit-input")) {
    return;
  }
  
  let input = createEditInput(span);
  let inputIcons = createInputIcons();

  li.appendChild(input);
  li.appendChild(inputIcons);

  setupInputEvents(input, span, li, inputIcons);

  span.style.display = "none";
  li.querySelector(".subtask-icons").style.display = "none";
  input.focus();
  input.select();
}

/**
 * Creates an input element for editing the subtask.
 * @param {HTMLElement} span - The span element containing the subtask text.
 * @returns {HTMLInputElement} The created input element.
 */
function createEditInput(span) {
  let input = document.createElement("input");
  input.type = "text";
  input.value = span.textContent.replace(/^\•\s*/, "");
  input.className = "edit-input";
  return input;
}

/**
 * Creates a container with icons for the edit input.
 * @returns {HTMLElement} The container element with icons.
 */
function createInputIcons() {
  let inputIcons = document.createElement("div");
  inputIcons.className = "input-icons";
  inputIcons.innerHTML = `
    <img src="/assets/img/contacts/delete.png" alt="Clear" class="delete-icon">
    <img src="/assets/img/addTask/check_grey.png" alt="Check" class="check-icon" onclick="submitEdit(this)">
  `;
  return inputIcons;
}

/**
 * Sets up events for the edit input element.
 * @param {HTMLInputElement} input - The input element for editing.
 * @param {HTMLElement} span - The span element containing the subtask text.
 * @param {HTMLElement} li - The subtask list item element.
 * @param {HTMLElement} inputIcons - The container element with icons.
 */
function setupInputEvents(input, span, li, inputIcons) {
  input.addEventListener("blur", () => {
    if (input.value.trim() === "") {
      span.textContent = `• Placeholder Text`;
    } else {
      span.textContent = `• ${input.value.trim()}`;
    }
    span.style.display = "";
    li.removeChild(inputIcons);
    li.querySelector(".subtask-icons").style.display = "flex";
  });
}

/**
 * Edit a subtask
 */
function submitEdit(element) {
  let input = element.closest(".one-subtask").querySelector(".edit-input");
  let li = input.closest(".one-subtask");
  let span = li.querySelector(".subtask-text");
  span.textContent = `• ${input.value.trim()}`;
  span.style.display = ""; 
  li.removeChild(input);
  li.removeChild(element.parentNode); 
  li.querySelector(".subtask-icons").style.display = "flex";
}

/**
 * Resets the form by clearing all input fields.
 */
function resetForm() {
  document.getElementById("input-title-addTask").value = "";
  document.getElementById("textarea-addTask").value = "";
  document.getElementById("date-addTask").value = "";
  document.getElementById("category").value = "";
  clearPriorityButtons();
  clearAbbreviations();
  clearSubtasks();
}

/**
 * Clears all input fields in the form.
 */
function clearInput() {
  document.getElementById("input-title-addTask").value = "";
  document.getElementById("textarea-addTask").value = "";
  document.getElementById("date-addTask").value = "";
  document.getElementById("input-title-addTasks").value = "";
  clearPriorityButtons();
  clearAbbreviations();
  clearSubtasks();
  clearAssignedCategories();
}

function clearAssignedCategories() {
  let checkboxes = document.querySelectorAll(".category-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  updateSelectedAbbreviations(); 
}

/**
 * Clears the state of priority buttons.
 */
function clearPriorityButtons() {
  let buttons = document.querySelectorAll(".prio-addTask button");
  buttons.forEach((button) => {
    button.setAttribute("value", "false");
    button.style.backgroundColor = "";
    button.classList.remove("btn-font", "active");
  });
}

/**
 * Clears the abbreviations display.
 */
function clearAbbreviations() {
  let abbreviationsContainer = document.getElementById("showName");
  abbreviationsContainer.innerHTML = "";
  clearCheckedContactsAssignedTo();
}

/**
 * This function disable all checked checkboxes at the 'Assigend To' input at addTask.html.
 */
function clearCheckedContactsAssignedTo() {
   
   
   let optionsContainer = document.getElementById("optionsContainer");
   Array.from(optionsContainer.children).forEach(option => {
     let checkbox = option.querySelector('input[type="checkbox"]');
     if (checkbox) {
       checkbox.checked = false;
     }
     option.classList.remove("active");
   });
    
    updateSelectedAbbreviations();
  }
  

/**
 * Clears the subtasks list.
 */
function clearSubtasks() {
  let tasksContainer = document.getElementById("addedTasks");
  tasksContainer.innerHTML = "";
}

/**
 * Sets the minimum date for the date input field to today's date.
 */
function setMinDateForCalendar() {
  let today = new Date().toISOString().split("T")[0];
  document.getElementById("date-addTask").setAttribute("min", today);
}

/**
 * Opens the "Add Task" modal or page and initializes the task form.
 * @param {string} getKanbanCategory - The category for the Kanban board.
 */
function openAddTask(getKanbanCategy) {
  if (window.innerWidth <= 1200) {
    window.location.href = "add_task.html";
  } else {
    document.getElementById("boardAddTaskMainBg").classList.remove("d-none");
    kanbanCategory = getKanbanCategy;
    document.getElementById("submitEditTask").style.display = "none";
    document.getElementById("saveTasks").style.display = "flex";
    document.getElementById("clearButton").style.display = "flex";
    document.getElementById("prio-up-orange").classList.remove("d-none");
    document.getElementById("prio-down-green").classList.remove("d-none");
    document.getElementById("prio-medium-ye").classList.remove("d-none");
    document.getElementById("prio-up-white").classList.add("d-none");
    document.getElementById("prio-down-white").classList.add("d-none");
    document.getElementById("prio-medium-white").classList.add("d-none");
    clearInput();
    let mediumButton = document.getElementById("medium");
    setButtonValues(mediumButton);
  }
}

function closeAddTask() {
  // Erfolgsmeldung verstecken
  let successElement = document.getElementById("contact-succesfully-created");
  if (successElement) {
    successElement.style.display = "none";
    
  }
  
  // Fenster schließen
  document.getElementById("boardAddTaskMainBg").classList.add("d-none");
  
  // Weitere Bereinigungslogik...
  if (addTaskInEditMode === true) {
    resetAddTaskHtml();
  }

  
}

/**
 * Adds event listeners for preventing form submission on Enter key press
 * and handling Enter key press for adding subtasks.
 */
document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("myForm");
  var subtaskInput = document.getElementById("input-title-addTasks");

  form.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  });

  subtaskInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addSubtask();
    }
  });
});

/**
 * Adds an event listener for editing a subtask on double click.
 */
document.getElementById("addedTasks").addEventListener("dblclick", function (event) {
    let li = event.target.closest("li.one-subtask");
    if (li &&!event.target.classList.contains("edit-icon") && !event.target.classList.contains("delete-icon")) {
      editSubtask(li);
    }
  });

  /**
 * Adds an event listener for deleting a subtask on click of the delete icon.
 */
document.getElementById("addedTasks").addEventListener("click", function (event) {
    let target = event.target;
    if (target.classList.contains("delete-icon")) {
      let li = target.closest("li.one-subtask");
      if (li) {
        li.remove();
      }
    }
  });

/**
 * Creates a subtask element.
 * @param {string} subtask - The subtask text.
 * @returns {HTMLElement} The subtask element.
 */
function createSubtaskElement(subtask, subtaskId) {
  if (isNaN(subtaskId)) {
    let newId = editTaskChangeSubtask("new", "add", subtask);
    subtaskId = newId;
  }

  let li = document.createElement("li");
  subtask = escapeHTML(subtask);
  li.className = "one-subtask";
  li.id = subtaskId;
  li.innerHTML = `
        <span class="subtask-text">• ${subtask}</span>
        <div class="subtask-icons">
            <img src="/assets/img/contacts/edit.png" alt="Bearbeiten" class="edit-icon">
            <img src="/assets/img/contacts/delete.png" alt="Löschen" class="delete-icon">
        </div>
    `;
  return li;
}
