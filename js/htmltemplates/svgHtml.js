/**
 * Returns an SVG string for a "To-Do" icon.
 * This SVG consists of a dark circle with a white checkmark inside, symbolizing an action that needs to be completed.
 * The SVG is defined with specific dimensions, colors, and internal structure suited for UI representation of a to-do item.
 * 
 * @returns {string} A string representing an SVG element for the "To-Do" icon.
 */
function returnHtmlSvgTodoIcon() {
  return `
    <svg width="40" height="40" viewBox="0 0 69 70" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="34.5" cy="35" r="34.5" fill="#2A3647"/>
  <mask id="mask0_175083_6090" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="18" y="19" width="33" height="32">
  <rect x="18.5" y="19" width="32" height="32" fill="#D9D9D9"/>
  </mask>
  <g mask="url(#mask0_175083_6090)">
  <path d="M25.1667 44.3332H27.0333L38.5333 32.8332L36.6667 30.9665L25.1667 42.4665V44.3332ZM44.2333 30.8998L38.5667 25.2998L40.4333 23.4332C40.9444 22.9221 41.5722 22.6665 42.3167 22.6665C43.0611 22.6665 43.6889 22.9221 44.2 23.4332L46.0667 25.2998C46.5778 25.8109 46.8444 26.4276 46.8667 27.1498C46.8889 27.8721 46.6444 28.4887 46.1333 28.9998L44.2333 30.8998ZM42.3 32.8665L28.1667 46.9998H22.5V41.3332L36.6333 27.1998L42.3 32.8665Z" fill="white"/>
  </g>
  </svg>
    `;
}

/**
 * Returns an SVG string for a "Done" icon.
 * This SVG consists of a dark circle with a white tick inside, symbolizing a completed action.
 * The SVG is defined with specific dimensions and styling appropriate for UI indications of completion or success.
 * 
 * @returns {string} A string representing an SVG element for the "Done" icon.
 */
function returnHtmlSvgDoneIcon() {
  return `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#2A3647"/>
    <path d="M11.3203 20.0001L17.8297 26.4151L28.6788 13.585" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `;
}