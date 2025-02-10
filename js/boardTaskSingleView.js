/**
 * This function fill the singel view task html with the data of the current task.
 *
 * @param {string} id - the firebase document id of the needed task
 */
function showTaskView(id) {
    let currentTask = boardGetTaskById(id);
  
    boardFillTaskWithCurrent(currentTask);
  
    document.getElementById("taskBgDiv").style.display = "flex";
    setTimeout(() => {
      document.getElementById("taskMainDiv").classList.add("visible");
    }, 120);
  }
  
  function hideTaskView() {
    document.getElementById("taskMainDiv").classList.remove("visible");
    setTimeout(() => {
      document.getElementById("taskBgDiv").style.display = "none";
    }, 120);
  }
  
  /**
   * This function fill the singel view task html with the data of the current task.
   *
   * @param {JSON} task - current task
   */
  function boardFillTaskWithCurrent(task) {
    const taskConfig = returnConfigBoardCardHtml(task);
    document.getElementById("taskBgDiv").innerHTML =
      returnHtmlBoardTaskSingleView(task, taskConfig);
  
    boardRenderAssignedLine(task);
    renderBoardSingleViewSubtasks(task);
    boardTaskAddEventListener();
  }
  
  /**
   * It will render the subtasks to the single view html.
   *
   * @param {JSON} task - current task
   */
  function renderBoardSingleViewSubtasks(task) {
    document.getElementById("boardTaskSingleSubtasks").innerHTML = "";
  
    if (task.subtasks.length > 0) {
      let subtasksConfig = returnBoardSubtaskConfig(task);
  
      for (i = 0; i < task.subtasks.length; i++) {
        const subtask = task.subtasks[i];
        if (!subtask.done) {
          subtasksConfig.svgSrc = "/assets/symbols/Property 1=Default.svg";
        }
        document.getElementById("boardTaskSingleSubtasks").innerHTML +=
          returnHtmlBoardSubtask(subtask, subtasksConfig, i);
      }
    } else {
      document.getElementById("boardTaskSingleSubtasks").innerHTML =
        "No Subtasks";
    }
  }
  
  /**
   * Returns the configuration of the current subtask.
   *
   * @param {JSON} task - current subtask
   * @returns - json
   */
  function returnBoardSubtaskConfig(task) {
    let subtasksConfig = {
      amount: task.subtasks.length - 1,
      svgSrc: "/assets/symbols/Property 1=checked.svg",
      parentTaskId: task.taskId,
    };
    return subtasksConfig;
  }
  
  /**
   * If you click on a subtask in task single view, this function will change the done
   * status to the opposit. It edits the firebase data and refresh the html single view, also the html board
   * to visualize the new data.
   *
   * @param {string} id - id of subtask document from firebase
   * @param {string} parentId - id of parent task element document from firebase
   */
  async function boardClickSubtask(id, parentId) {
    let task = boardGetTaskById(parentId);
  
    let subtask = task.subtasks[id];
    subtask.done = !subtask.done;
    document.getElementById(`taskSubtask${id}`).src = subtask.done
      ? "/assets/symbols/Property 1=checked.svg"
      : "/assets/symbols/Property 1=Default.svg";
  
    let changedTask = boardGetTaskById(parentId);
  
    await updateTask(parentId, changedTask);
  
    await loadTasks();
    loadBoardKanbanContainer(boardTasks);
  }
  
  /**
   * This function used to interfere throw the 'assigned to' of the task, and render the
   * profilebadges as well as the names to the single view task html.
   *
   * @param {JSON} task - current task
   */
  function boardRenderAssignedLine(task) {
    for (i = 0; i < task.assignedTo.length; i++) {
      let initials = boardGetInitials(task.assignedTo[i].name);
      document.getElementById("boardTaskSingleViewAssigned").innerHTML +=
        returnHtmlBoardAssignedLine(task.assignedTo[i], initials);
    }
  }
  
  /**
   * The function used to add the Eventlistener. So the Eventlistener cound be loaded
   * with this function, afterall the html page is complete with loading.
   */
  function boardTaskAddEventListener() {
    const deleteDiv = document.getElementById("taskFooterDel");
    const deleteIcon = document.getElementById("deleteIcon");
  
    deleteDiv.addEventListener("mouseenter", () => {
      deleteIcon.src = "/assets/symbols/deleteHover.svg";
    });
  
    deleteDiv.addEventListener("mouseleave", () => {
      deleteIcon.src = "/assets/symbols/delete.svg";
    });
  
    const editDiv = document.getElementById("taskFooterEdit");
    const editIcon = document.getElementById("editIcon");
  
    editDiv.addEventListener("mouseenter", () => {
      editIcon.src = "/assets/symbols/editHover.svg";
    });
  
    editDiv.addEventListener("mouseleave", () => {
      editIcon.src = "/assets/symbols/edit.svg";
    });
  }
  
  /**
   * The function used to add the Eventlistener. So the Eventlistener cound be loaded
   * with this function, afterall the html page is complete with loading.
   */
  function boardKanbanAddEventListener() {
    const buttons = document.querySelectorAll(".board-kanban-add-btn");
  
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", () => {
        button.src = "/assets/symbols/plus button mobile hover.svg";
      });
      button.addEventListener("mouseleave", () => {
        button.src = "/assets/symbols/plus button mobile.svg";
      });
    });
  }