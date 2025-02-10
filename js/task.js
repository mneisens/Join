/**
 * Initializes the tasks related to SVG manipulation in the user interface.
 * This function serves as an entry point to setup or refresh the necessary SVG elements in the task UI.
 */
function initTask(){
    taskFillSvg();
}

/**
 * Fills SVG content into the task management UI. This function specifically updates the HTML content
 * of the 'delete' and 'edit' footer sections with corresponding SVG graphics fetched from other functions.
 */
function taskFillSvg(){
    document.getElementById('taskFooterDel').innerHTML = returnHtmlSvgDel();
    document.getElementById('taskFooterEdit').innerHTML = returnHtmlSvgEdit();
}

/**
 * Displays the task view element with a transition. This function makes the background of the task view visible
 * and gradually adds visibility to the main task div using CSS transitions.
 */
function showTaskView(){
    document.getElementById('taskBgDiv').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('taskMainDiv').classList.add('visible');
    }, 120);
}

/**
 * Hides the task view element with a transition. This function removes the visibility class from the main task div
 * and hides the background div after a delay, matching the CSS transition duration.
 */
function hideTaskView(){
    document.getElementById('taskMainDiv').classList.remove('visible');
    setTimeout(() => {
        document.getElementById('taskBgDiv').style.display = 'none';
    }, 120);
}