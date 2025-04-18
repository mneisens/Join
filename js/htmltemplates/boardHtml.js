/**
 * Generates HTML for a preview card of a task on a board.
 * This card includes interactive elements for touch and click events to manage tasks,
 * such as dragging, viewing detailed task info, and tracking progress.
 *
 * @param {Object} task - An object containing task details such as taskId, category, and header.
 * @param {Object} taskConfig - Configuration object for task attributes like category background color, priority symbol path, and subtask progress details.
 * @param {string} htmlAssignedTo - HTML string representing the assigned users' badges.
 * @returns {string} HTML string for a task preview card.
 */
function returnHtmlBoardTaskPreviewCard(task, taskConfig, htmlAssignedTo) {
  return `
      <div ontouchmove="boardTouchMove(event)" ontouchstart="boardTouchStart(event, '${task.taskId}')" 
      ontouchend="boardTouchEnd(event, '${task.taskId}')" id="boardTaskCard${task.taskId}" 
      onclick="showTaskView('${task.taskId}')" draggable="true" 
      ondragstart="boardStartDragging(event, '${task.taskId}')" class="board-preview-card" ondragend="boardOnDragEnd()">
        <div class="board-preview-card-kat ${taskConfig.catBg}">
          <p>${task.category}</p>
        </div>
  
        <div class="board-preview-preview">
          <!-- title -->
          <p>${task.header}</p>
          <!-- content preview-->
          <p>${taskConfig.shortDescription}</p>
        </div>
  
        <!-- progress -->
        <div class="board-card-progress-main" style="display:${taskConfig.subtaskProgress.display};">
          <!-- progress bar -->
          <div class="board-card-porg-bar">
            <div class="board-prog-bar-prog" style="width:${taskConfig.subtaskProgress.percent}%;"></div>
          </div>
          <!-- progress view -->
          <p>${taskConfig.subtaskProgress.done}/${taskConfig.subtaskProgress.amount} Subtasks</p>
        </div>
        
  
        <!-- card footer -->
        <div class="board-card-footer-main">
          <!-- editors -->
          <div class="board-card-footer-profileBadge">
          ${htmlAssignedTo}
          </div>
  
          <!-- priority icon -->
          <img
            src="${taskConfig.pathPrioSymbol}"
            alt="priority simbol"
          />
        </div>
      </div>
    `;
}

/**
 * Creates an HTML badge for a profile based on the assigned person's initials and a specified color.
 *
 * @param {Object} assignedTo - Object containing color information for the badge background.
 * @param {string} initials - The initials of the person assigned to a task.
 * @returns {string} HTML string for a profile badge.
 */
function returnHtmlBoardProfileBadge(assignedTo, initials) {
  return `
      <div class="board-profile-badge" style="background-color: ${assignedTo.color};">${initials}</div>
    `;
}

/**
 * Generates an HTML badge for overflow profiles in a task, using a default background color.
 *
 * @param {string} initials - The initials to be displayed on the badge.
 * @returns {string} HTML string for an overflow profile badge.
 */
function returnHtmlBoardProfileBadgeOverflow(initials) {
  return `
      <div class="board-profile-badge" style="background-color: #2A3647;">${initials}</div>
    `;
}

/**
 * Returns HTML content for displaying a message when there are no tasks in a specific board category.
 *
 * @param {string} boardNoTaskStr - Message to be displayed when there are no tasks.
 * @returns {string} HTML string for displaying a no tasks message.
 */
function returnHtmlBoardNoTasksToDo(boardNoTaskStr) {
  return `
    <div class="board-no-tasks-toDo-box">
      <p>${boardNoTaskStr}</p>
    </div>
    `;
}

/**
 * Generates HTML for displaying detailed view of a single task.
 * This view includes task attributes, actions like delete and edit, and assigns detail sections.
 *
 * @param {Object} task - Object containing detailed information about the task.
 * @param {Object} taskConfig - Configuration object including category background color, priority symbol path, and priority description.
 * @returns {string} HTML string for a detailed single task view.
 */
function returnHtmlBoardTaskSingleView(task, taskConfig) {
  return `
    <div id="taskMainDiv" onclick="event.stopPropagation()" class="task-main-div">
      <div class="task-content-main-div">
      <div class="task-main-header">
          <div class="task-label-div ${taskConfig.catBg}">${task.category}</div>
          <img onclick="hideTaskView()" id="task-x-btn" src="/assets/symbols/close.svg" alt="x">
      </div>
      <span class="task-headline">${task.header}</span>
      <span class="task-description">${task.description}</span>
      <div class="task-due-prio-line">
          <p>Due date:</p>
          <p>${task.dueDate}</p>
      </div>
      <div class="task-due-prio-line">
          <p>Priority:</p>
          <div class="task-priority">
              ${taskConfig.taskPrioString}
              <img src="${taskConfig.pathPrioSymbol}" alt="priority">
          </div>
      </div>

      <div class="task-assigned-to-main">
        <span id='boardAssigned'>Assigned To:</span>
        <div id="boardTaskSingleViewAssigned" class="task-assigned-to-container" ></div>
      </div>
  
      <div class="task-subtasks-main">
          <span>Subtasks:</span>
          <div id="boardTaskSingleSubtasks" class="task-subtasks-container">
          </div>
      </div>
  
      <div class="task-main-footer">
          <div class="task-footer">
              <div id="taskFooterDel" class="task-footer-del-edit" onclick="deleteTask('${task.taskId}')">
                <img id="deleteIcon" src="/assets/symbols/delete.svg" alt="trash can">
                Delete
              </div>
              <div onclick="initEditTask('${task.taskId}', event)" id="taskFooterEdit" class="task-footer-del-edit">
                <img id="editIcon" src="/assets/symbols/edit.svg" alt="trash can">
                Edit
              </div>
          </div>
      </div>
      </div>
    </div>
    `;
}

/**
 * Returns HTML for a subtask item, used in the task details view.
 * Each subtask item includes a clickable SVG for marking the subtask status and displays the subtask description.
 *
 * @param {Object} subtask - Object containing the subtask description.
 * @param {Object} subtasksConfig - Configuration object including the SVG source path for the status button and the parent task ID.
 * @param {number} i - Index of the subtask in the list, used to uniquely identify elements.
 * @returns {string} HTML string for a subtask item.
 */
// function returnHtmlBoardSubtask(subtask, subtasksConfig, i) {
//   return `
//     <div class="task-subtask">
//       <img id="taskSubtask${i}" onclick="boardClickSubtask(${i}, '${subtasksConfig.parentTaskId}')" src="${subtasksConfig.svgSrc}" alt="checkbutton">
//       <p>${subtask.subtask}</p>
//     </div>
//     `;
// }


// function returnHtmlBoardSubtask(subtask, subtasksConfig, i) {
//   const isChecked = subtask.done ? "checked" : "";
//   const taskId = subtasksConfig.parentTaskId;
//   return `
//     <div class="task-subtask">
//       <img id="taskSubtask${i}" onclick="boardClickSubtask(${i}, '${subtasksConfig.parentTaskId}')" src="${subtasksConfig.svgSrc}" alt="checkbutton">
//       <p>${subtask.subtask}</p>
//     </div>
//     `;
// }


// function returnHtmlBoardSubtask(subtask, config, index) {
//   const isChecked = subtask.done ? "checked" : "";
//   const taskId = config.parentTaskId;
  
//   return `
//     <div class="board-task-single-subtask-row ${isChecked ? 'done' : ''}" data-task-id="${taskId}" data-subtask-index="${index}">
//       <div class="board-task-single-subtask-checkbox" >
//         <input type="checkbox" ${isChecked} class="subtask-checkbox" 
//                onclick="boardClickSubtask('${taskId}', ${index})">
//       </div>
//       <div class="board-task-single-subtask-text">${subtask.subtask}</div>
//     </div>
//   `;
// }

function returnHtmlBoardSubtask(subtask, config, index) {
  // Wähle das richtige Bild abhängig vom Status
  const checkboxImg = subtask.done ? 
    "/assets/symbols/Property 1=checked.svg" : 
    "/assets/symbols/Property 1=Default.svg";
  
  return `
    <div class="board-task-single-subtask-row" style="display:flex; flex-direction:row; gap:10px" data-subtask-index="${index}" data-task-id="${config.parentTaskId}">
      <div class="board-task-single-subtask-checkbox" onclick="boardClickSubtask('${config.parentTaskId}', ${index})">
        <img src="${checkboxImg}" alt="checkbox">
      </div>
      <div class="board-task-single-subtask-text">${subtask.subtask}</div>
    </div>
  `;
}



/**
 * Generates HTML content for displaying assigned users' details in a task view.
 * Each assigned user is represented with a color-coded badge and their name.
 *
 * @param {Object} assignedTo - Object containing user details like color and name.
 * @param {string} initials - Initials of the assigned user.
 * @returns {string} HTML string for assigned users' line in the task view.
 */
function returnHtmlBoardAssignedLine(assignedTo, initials) {
  return `
    <div class="task-assigned-users-div">
      <div class="task-assigned-user-main">
          <div class="task-assigned-user-inner">
              <div class="board-profile-badge" style="background-color: ${assignedTo.color};">${initials}</div>
              <span>${assignedTo.name}</span>
          </div>
      </div>
    </div>
  `;
}


