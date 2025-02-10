let editTaskId = "";
let editTaskArr = [];
let editTaskSubtaskArr = [];
let editTaskAssignedToIdArr = [];
let allowToPushEditTask = false;
let addTaskInEditMode = false;

/**
 * This function initialize the EditTask Sektion.
 *
 * @param {string} taskId - the firebase id of the current task
 * @param {Event} e
 */
function initEditTask(taskId, e) {
  let clickedElement = e.target;
  let width =
    clickedElement.parentElement.parentElement.parentElement.offsetWidth;
  editTaskId = taskId;

  editTaskArr = boardGetTaskById(taskId);
  setEditTaskAssignedToArr();

  setUpBtnsEditTask();
  resetForm();
  setDataFieldsEditTask();

  document.getElementById("boardAddTaskMainBg").classList.remove("d-none");

  allowToPushEditTask = true;
  addTaskInEditMode = true;
}

/**
 * This function hide the normal buttons at addTask, to use it for editTask.
 */
function setUpBtnsEditTask() {
  document.getElementById("clearButton").style.display = "none";
  document.getElementById("saveTasks").style.display = "none";
  document.getElementById("submitEditTask").style.display = "flex";
  document.getElementById("boardHeadAddTask").classList.add("d-none");

  /* the following could also be solved in mediaQuery css */
  document.getElementById("add-task-board").style.padding = "100px 10px";
  document.getElementById("addTaskBoardBorder").style.height = "100%";
  document.getElementById("textarea-addTask").style.margin = "0px";

  document.getElementById("submitEditTask").style.margin = "0px";
  document.getElementById("submitEditTask").style.width = "100%";
}

/**
 * The setDataFieldsEditTask function insert all given data in task wich is
 * used to edit.
 */
function setDataFieldsEditTask() {
  document.getElementById("input-title-addTask").value = editTaskArr.header;
  document.getElementById("textarea-addTask").value = editTaskArr.description;

  let formattedDate = returnValidDateFormat(editTaskArr.dueDate);
  document.getElementById("date-addTask").value = formattedDate;

  checkBoxEditTaskAssignedTo();
  updateSelectedAbbreviations();

  document.getElementById("category").value = editTaskArr.category;

  addSubtaskEditTask(editTaskArr.subtasks);
  editTaskSubtaskArr = editTaskArr.subtasks;

  let btn = document.getElementById(editTaskArr.priority);
  setButtonValues(btn);
}

/**
 * This function translate the formate from string to a usable formate for dueDate input Form.
 *
 * @param {string} dateString - string wich is saved in firestore
 * @returns
 */
function returnValidDateFormat(dateString) {
  let [day, month, year] = dateString.split("/");
  let formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

/**
 * This function used to push the edit task to the firestore database.
 */
async function pushEditTaskToDatabase() {
  if (allowToPushEditTask === true) {
    if (editTaskId.length > 0) {
      kanbanCategory = editTaskArr.kanbanCategory;

      let givenEditTask = collectFormData();
      givenEditTask.subtasks = editTaskSubtaskArr;
      await updateTask(editTaskId, givenEditTask);

      kanbanCategory = "Todo";
      resetAddTaskHtml();
      addTaskInEditMode = false;
    }
  }
}

/**
 * This function add subtasks to the addTask.html.
 *
 * @param {Array} subtasks
 * @returns
 */
function addSubtaskEditTask(subtasks) {
  editTaskSubtaskArr = subtasks;
  for (i = 0; i < subtasks.length; i++) {
    let subtask = subtasks[i].subtask;
    let subtaskId = i;
    if (subtask === "") return;
    let ul = document.getElementById("addedTasks");
    ul.appendChild(createSubtaskElement(subtask, subtaskId));
  }
}

/**
 * This function handle the changes of subtasks, so the editTaskSubtaskArr will be
 * up to date for later use.
 *
 * @param {Array} subtaskArrId
 * @param {string} process - a string given to handle upcoming process
 * @param {string} txt - the subtask text
 * @returns
 */
function editTaskChangeSubtask(subtaskArrId, process, txt) {
  if (process === "delete") {
    editTaskSubtaskArr.splice(subtaskArrId, 1);
    clearSubtasks();
    addSubtaskEditTask(editTaskSubtaskArr);
  } else if (process === "change") {
    if (!isNaN(subtaskArrId)) {
      editTaskSubtaskArr[subtaskArrId].subtask = txt;
    }
  } else if (process === "add") {
    let newId = editTaskSubtaskArr.length;
    editTaskSubtaskArr.push({ done: false, subtask: txt });
    return newId;
  }
}

/**
 * It will update the editTaskAssignedTo Array for later use.
 */
function setEditTaskAssignedToArr() {
  editTaskAssignedToIdArr = [];
  for (i = 0; i < editTaskArr.assignedTo.length; i++) {
    editTaskAssignedToIdArr.push(editTaskArr.assignedTo[i].id);
  }
}

/**
 * This function is able to look for the checkboxes in assignedto choose menue. So all
 * Conatcts in the list, the task is assigned to, are going to set to checked.
 */
function checkBoxEditTaskAssignedTo() {
  let optionsContainer = document.getElementById("optionsContainer");

  for (x = 0; x < editTaskAssignedToIdArr.length; x++) {
    for (i = 0; i < optionsContainer.children.length; i++) {
      let option = optionsContainer.children[i];
      if (option.id === editTaskAssignedToIdArr[x]) {
        let checkbox = option.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = true;
        }
      }
    }
  }
}

/**
 * Take a reset of addTaskhtml for later use.
 */
function resetAddTaskHtml() {
  document.getElementById("clearButton").style.display = "flex";
  document.getElementById("saveTasks").style.display = "flex";
  document.getElementById("submitEditTask").style.display = "none";
  document.getElementById("boardHeadAddTask").classList.remove("d-none");
  resetForm();
  document.getElementById("boardAddTaskMainBg").classList.add("d-none");
  document.getElementById("taskBgDiv").style.display = "none";
  loadBoard();

  document.getElementById("add-task-board").style.padding = "10px";
  document.getElementById("addTaskBoardBorder").style.height = "850px";
  document.getElementById("textarea-addTask").style.margin = "0px 0px 32px 0px";

  document.getElementById("submitEditTask").style.margin = "16px";
  document.getElementById("submitEditTask").style.width = "183px";

  addTaskInEditMode = false;
}
