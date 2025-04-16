/**
 * This function handle the touch start event. It is using a timeout function, for validation
 * of a long term touch. Only if is true, the kanbanKategory changeing is available.
 *
 * @param {event} e - gives the current event
 * @param {string} taskId - gives the current TaskId
 */
function boardTouchStart(e, taskId) {
  timer = setTimeout(() => {
    [...e.changedTouches].forEach((touch) => {
      const dot = document.getElementById("boardMobileDragNav");
      dot.style.display = "flex";
      dot.style.top = `${touch.pageY}px`;
      dot.style.left = `${touch.pageX}px`;
      document.body.append(dot);

      const dot2 = document.getElementById("board-mobile-nav-txt");
      dot2.style.display = "flex";
      dot2.style.top = `${touch.pageY}px`;
      dot2.style.left = `${touch.pageX}px`;
      document.body.append(dot2);

      touchStartY = touch.pageY;
      touchStartX = touch.pageX;

      touchAllowDropEnoughtWaiting = true;
    });
  }, longPressDuration);
}

/**
 * Checks if a coordinate is within a specified range.
 * 
 * @param {number} pageCoord - The current coordinate value (e.g., pageX or pageY).
 * @param {number} startCoord - The starting coordinate value to compare against.
 * @returns {boolean} - Returns true if the coordinate is within the range of startCoord ± 110, otherwise false.
 */
function isInRange(pageCoord, startCoord) {
  return pageCoord > startCoord - 110 && pageCoord < startCoord + 110;
}

/**
 * Highlights the appropriate drop zone based on the touch coordinates and returns the category.
 * 
 * @param {Touch} touch - The touch object containing the touch coordinates.
 * @returns {string} - Returns the category of the drop zone ("Todo", "AwaitFeedback", "InProgress", "Done").
 */
function handleTouchHighlight(touch) {
  if (touch.pageX < touchStartX && touch.pageY < touchStartY) {
    boardTouchHighlightDropTodo();
    return "Todo";
  } else if (touch.pageX < touchStartX && touch.pageY >= touchStartY) {
    boardTouchHighlightDropFeedback();
    return "AwaitFeedback";
  } else if (touch.pageX >= touchStartX && touch.pageY < touchStartY) {
    boardTouchHighlightDropProgress();
    return "InProgress";
  } else {
    boardTouchHighlightDropDone();
    return "Done";
  }
}

/**
 * Handles the touch move event on the board. Checks if the touch coordinates are within range,
 * highlights the appropriate drop zone, and sets the drop category and allowance accordingly.
 * 
 * @param {TouchEvent} e - The touch event object.
 */
function boardTouchMove(e) {
  [...e.changedTouches].forEach((touch) => {
    if (isInRange(touch.pageX, touchStartX) && isInRange(touch.pageY, touchStartY)) {
      touchDropCategory = handleTouchHighlight(touch);
      touchAllowDrop = true;
    } else {
      touchAllowDrop = false;
      boardRemoveTouchDropHighlight();
    }
  });
}

/**
 * It is removing the highlight from the touch drag and drop menue. Used for case, if touch moves out of
 * drop area.
 */
function boardRemoveTouchDropHighlight(){
  document.getElementById('touchDropTodo').classList.remove("board-m-d-n-drop-area-hover");
  document.getElementById('touchDropProgress').classList.remove("board-m-d-n-drop-area-hover");
  document.getElementById('touchDropFeedback').classList.remove("board-m-d-n-drop-area-hover");
  document.getElementById('touchDropDone').classList.remove("board-m-d-n-drop-area-hover");
}

/**
 * This funcion used to highligth the potential drop area at the touch kanbanKategory menue.
 *
 * @param {string} activeId
 */
function highlightDropArea(activeId) {
  const areas = [
    "touchDropTodo",
    "touchDropProgress",
    "touchDropFeedback",
    "touchDropDone",
  ];
  areas.forEach((id) => {
    document
      .getElementById(id)
      .classList.toggle("board-m-d-n-drop-area-hover", id === activeId);
  });
}
function boardTouchHighlightDropTodo() {
  highlightDropArea("touchDropTodo");
}
function boardTouchHighlightDropProgress() {
  highlightDropArea("touchDropProgress");
}
function boardTouchHighlightDropFeedback() {
  highlightDropArea("touchDropFeedback");
}
function boardTouchHighlightDropDone() {
  highlightDropArea("touchDropDone");
}

/**
 * This function jandle the touchend event. It will hide the touch dragdrop menue, and
 * change the kanban category of choosen task.
 * 
 * @param {event} e - current event
 * @param {string} taskId - string of current taskId from firestore database
 */
async function boardTouchEnd(e, taskId) {
  clearTimeout(timer);
  [...e.changedTouches].forEach((touch) => {
    const dot = document.getElementById("boardMobileDragNav");
    dot.style.display = "none";

    const dot2 = document.getElementById("board-mobile-nav-txt");
    dot2.style.display = "none";
  });
  if (touchAllowDropEnoughtWaiting === true) {
    if (touchAllowDrop === true) {
      let draggedTask = boardGetTaskById(taskId);
      draggedTask.kanbanCategory = touchDropCategory;
      await updateTask(taskId, draggedTask);
      await loadTasks();
      loadBoardKanbanContainer(boardTasks);
    }
  }
  touchAllowDropEnoughtWaiting = false;
  touchAllowDrop = false;
}

/**
 *This function is called if the ondragstart event is triggerd at the perview card. It will prevent that a copie
 of the dragged element is shown, transform the dragged element and highlight the drop Area.

 * @param {Event} event - event
 * @param {string} id - The firebase document id of the dragged task card.
 */
function boardStartDragging(event, taskId) {
  const element = event.target;
  const elementHeight = element.offsetHeight;
  const elementWidth = element.offsetWidth;  

  boardDragIsStarted = true;

  let boardCurrentTask = boardGetTaskById(taskId);
  let kanCatBeforeAfter = getBoardKanCategoryBeforeAfter(
    boardCurrentTask.kanbanCategory
  );

  boardCutOffMaxHeight();
  boardHighlightDropArea(elementHeight, elementWidth, kanCatBeforeAfter);
  boardDraggedElementId = taskId;
}

function allowDrop(ev) {
  ev.preventDefault();
}

/**
 * If the dragged Element drop into the drop area, this function will catch the element and
 * change the category of the dropped task. Thereafter it will fetch the tasks from firebase
 * data and render the new data to the kanban board.
 *
 * @param {string} category - The category, wich will be the new of the dragged task.
 */
async function boardDropElementTo(category) {
  try {
    if (!boardDraggedElementId) {
      console.warn("Keine Task-ID zum Verschieben vorhanden");
      return;
    }
    
    console.log(`Task ${boardDraggedElementId} wird nach ${category} verschoben...`);
    
    // API-Aufruf zum Aktualisieren der Kategorie
    await updateTaskCategory(boardDraggedElementId, category);
    
    // Board neu laden
    await boardLoadTasksFromBackend();
    
    // Drag & Drop-Status zurücksetzen
    boardSetMaxHeight();
    boardDragIsStarted = false;
    boardDraggedElementId = null;
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Task-Kategorie:", error);
  }
}

function boardOnDragEnd(){
  if(boardDragIsStarted===true){
    boardSetMaxHeight();
    loadBoardKanbanContainer(boardTasks);
    boardDragIsStarted = false;
  }
}

/**
 * This function used to highlight the drop area for current dragged task card.
 *
 * @param {integer} elementHeight - The height of current dragged task card.
 * @param {Array} kanCatBeforeAfter - The kanban categorys wich used to be highlighted.
 */
function boardHighlightDropArea(
  elementHeight,
  elementWidth,
  kanCatBeforeAfter
) {
  if (kanCatBeforeAfter.length > 0) {
    kanCatBeforeAfter.forEach((cat) => {
      const target = document.getElementById(`boardCardsContainer${cat}`);
      if (target) {
        target.insertAdjacentHTML(
          "afterbegin",
          `
            <div class="board-no-tasks-toDo-box" style="height: ${elementHeight}px; width: ${elementWidth}px; background: transparent; box-shadow: none;"></div>
          `
        );
      } else {
        console.error(
          `ERROR: Element with id 'boardCardsContainer${cat}' not found.`
        );
      }
    });
  } else {
    console.error("ERROR: The given array is empty.");
  }
}

function boardCutOffMaxHeight(){
  let elements = document.querySelectorAll('.board-cards-container');
  elements.forEach((el)=>{
    el.style.width = "fit-content";
  });
}

function boardSetMaxHeight(){
  let elements = document.querySelectorAll('.board-cards-container');
  elements.forEach((el)=>{
    el.style.width = "100%";
  });
}