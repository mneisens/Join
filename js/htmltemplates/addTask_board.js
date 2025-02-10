/**
 * Generates the HTML for a category option.
 * @param {Object} category - The category data.
 * @param {string} category.name - The name of the category.
 * @param {string} category.color - The color associated with the category.
 * @returns {string} The HTML string for the category option.
 */
function createCategoryOptionHTML(category) {
    let initials = category.name.split(' ').map(name => name.charAt(0).toUpperCase()).join('');
    let color = category.color || 'rgba(42, 54, 71, 1)';
    return `
        <span style="margin-right: 10px; background-color: ${color}; color: white; padding: 5px 10px; border-radius: 50%;">${initials}</span>
        <label style="flex-grow: 1;">${category.name}</label>
        <input type="checkbox" class="category-checkbox" data-initials="${initials}" data-color="${color}" data-name="${category.name}" data-id="${category.id}" onchange="updateSelectedAbbreviations()">
    `;
}


/**
 * Edits a subtask.
 * @param {HTMLElement} li - The subtask list item element.
 */
function editSubtask(li) {
    let span = li.querySelector('.subtask-text');
    if (li.querySelector('.edit-input')) return; 

    let input = createInputElement(span);
    let inputIcons = createInputIcons();

    appendElements(li, input, inputIcons);
    setupInputEventHandlers(li, span, input, inputIcons);

    span.style.display = 'none';
    li.querySelector('.subtask-icons').style.display = 'none';
    input.focus();
    input.select();
}

/**
 * Creates the input element for editing.
 * @param {HTMLElement} span - The span element containing the subtask text.
 * @returns {HTMLInputElement} The created input element.
 */
function createInputElement(span) {
    let input = document.createElement('input');
    input.type = 'text';
    input.value = span.textContent.replace(/^\•\s*/, '');
    input.className = 'edit-input';
    return input;
}

/**
 * Creates the input icons (delete and check).
 * @returns {HTMLDivElement} The created input icons container.
 */
function createInputIcons() {
    let inputIcons = document.createElement('div');
    inputIcons.className = 'input-icons';
    inputIcons.innerHTML = `
        <img src="/assets/img/contacts/delete.png" alt="Clear" class="delete-icon">
        <img src="/assets/img/addTask/check_grey.png" alt="Check" class="check-icon" onclick="submitEdit(this)">
    `;
    return inputIcons;
}

/**
 * Appends the input and icons to the list item.
 * @param {HTMLElement} li - The list item element.
 * @param {HTMLInputElement} input - The input element.
 * @param {HTMLDivElement} inputIcons - The input icons container.
 */
function appendElements(li, input, inputIcons) {
    li.appendChild(input);
    li.appendChild(inputIcons);
}

/**
 * Sets up event handlers for the input element.
 * @param {HTMLElement} li - The list item element.
 * @param {HTMLElement} span - The span element containing the subtask text.
 * @param {HTMLInputElement} input - The input element.
 * @param {HTMLDivElement} inputIcons - The input icons container.
 */
function setupInputEventHandlers(li, span, input, inputIcons) {
    input.addEventListener('blur', () => {
        if (input.value.trim() === "") {
            span.textContent = `• Placeholder Text`;
        } else {
            span.textContent = `• ${input.value.trim()}`;
            editTaskChangeSubtask(li.id, "change", `${input.value.trim()}`);
        }
        span.style.display = '';
        li.removeChild(input);
        li.removeChild(inputIcons);
        li.querySelector('.subtask-icons').style.display = 'flex';
    });
}


