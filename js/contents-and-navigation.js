const sections = document.querySelectorAll(".section");

insertHeadingHrefs();
populateSectionsLists();
populateGlossaryIndex();
const tocs = generateTOCs();
updatePageContent(); // Executes after 'DOMContentLoaded' event (i.e. on page load and refresh) due to 'defer' attribute of script tag
window.onpopstate = updatePageContent; // Executes when navigating through the session history stack

/* **DEPRECATED MECHANISM REPLACED BY CSS MULTI-COLUMN LAYOUT MODULE**
updateGlossaryIndexLayout(); // For populating the glossary index on page load

// The resize event listener mechanism below is using a debouncing approach
let debounceID;
window.addEventListener("resize", () => {
  clearTimeout(debounceID);
  debounceID = setTimeout(updateGlossaryIndexLayout, 100);
});
*/

/* Function Definitions Below */

// Updates the page based on the 'window.location' object and sets/updates the proper meta tags like document title and etc.
function updatePageContent() {
  const page404 = document.getElementById("404");
  const navTitle = document.querySelector(".nav-title");

  hideNavDropdown();
  let path = location.pathname;
  let notFound = true;

  path = path.slice(1); // trims leading '/'
  if (path.endsWith("/")) path = path.slice(0, -1); // trims trailing '/'

  if (path === "") path = "glossary";

  sections.forEach(elem => {
    if (elem.id === path) {
      elem.style.display = "initial";
      document.title = elem.dataset.titleShort;
      navTitle.textContent = elem.dataset.titleLong ? elem.dataset.titleLong : elem.dataset.titleShort;
      notFound = false;
    } else elem.style.display = "none";
  });

  if (notFound) {
    page404.style.display = "initial";
    document.title = "Error 404";
    navTitle.textContent = "Page Not Found";
    updateTOC("notFound");
  } else {
    page404.style.display = "none";
    updateTOC(path);

    // Removes the highlight from the previously highlighted dropdown item and adds a new highlight based on variable 'path'
    const previousDropdownHL = document.querySelector(".dropdown-content > .active");
    if (previousDropdownHL) previousDropdownHL.classList.remove("active");
    const dropdownItems = document.querySelector(".dropdown-content").children;
    for (let elem of dropdownItems) {
      if (elem.dataset.path === "/" + path) {
        elem.classList.add("active");
        break;
      }
    }

    // Scrolls the heading denoted by the url hash to the top of the page
    const hash = location.hash;
    if (hash) document.querySelector(hash).scrollIntoView(true);
  }

  if (path === "glossary") hideSidebarWithoutTransition();
}

// Calls 'window.history.pushState' with a new URL, then calls 'updatePageContent'
function navigateToLocation(e) {
  const url = e.target.dataset.path;
  history.pushState(null, document.title, url);
  updatePageContent();
}

// For sections list entries: <a data-path="/somepath" title="Full Description">description</a>
// For glossary index entries: <a data-path="/somepath#somefragment" class="index-entry">description</a>
// Concerning the argument object, only the 'path' property is required, all other properties are optional. All argument properties with the exception of 'classes' shall be of type <string>, 'classes' shall be of type <string>[]
function createLinkElement({ path, fragment, textContent, titleContent, classes }) {
  const a = document.createElement("a");
  a.setAttribute("data-path", "/" + path + (fragment ? "#" + fragment : ""));
  a.textContent = textContent ? textContent : titleContent ? titleContent : fragment ? fragment : path;
  if (titleContent) a.setAttribute("title", titleContent);
  if (classes) classes.forEach(className => a.classList.add(className));
  a.onclick = navigateToLocation;
  return a;
}

// Generate the sections list for both the nav dropdown and the glossary page
function populateSectionsLists() {
  const navDropdown = document.querySelector(".dropdown-content");
  const glossarySections = document.querySelector(".glossary-sections");

  const navDropdownEntries = [],
    glossarySectionsEntries = [];
  sections.forEach(section => {
    navDropdownEntries.push(
      createLinkElement({
        path: section.id,
        textContent: section.dataset.titleShort,
        titleContent: section.dataset.titleLong ? section.dataset.titleLong : section.dataset.titleShort,
      })
    );
    if (section.id !== "glossary")
      glossarySectionsEntries.push(
        createLinkElement({
          path: section.id,
          textContent: section.dataset.titleShort,
          titleContent: section.dataset.titleLong ? section.dataset.titleLong : section.dataset.titleShort,
        })
      );
  });

  // Attach the entry elements to the DOM tree
  navDropdownEntries.forEach(entry => navDropdown.appendChild(entry));
  glossarySectionsEntries.forEach(entry => glossarySections.appendChild(entry));
}

function populateGlossaryIndex() {
  // Helper functions for generation of glossary index content
  function isAlphaNum(char = "") {
    return /[0-9A-Za-z]/.test(char);
  }
  function isNum(char = "") {
    return /[0-9]/.test(char);
  }

  // Generate the glossary index entries
  let glossaryIndexEntries = [];
  sections.forEach(section => {
    glossaryIndexEntries.push(
      createLinkElement({
        path: section.id,
        textContent: section.dataset.titleLong ? section.dataset.titleLong : section.dataset.titleShort,
        classes: ["index-entry"],
      })
    );
    section.querySelectorAll("[id]").forEach(topic =>
      glossaryIndexEntries.push(
        createLinkElement({
          path: section.id,
          fragment: topic.id,
          textContent: topic.textContent,
          classes: ["index-entry"],
        })
      )
    );
  });

  // Sort glossary index entries alphanumerically by string value
  glossaryIndexEntries.sort((a, b) => {
    let short;
    a = a.textContent.toLowerCase();
    b = b.textContent.toLowerCase();
    if (a[0] === `"` || a[0] === `'` || a[0] === "`") a = a.substring(1);
    if (b[0] === `"` || b[0] === `'` || b[0] === "`") b = b.substring(1);

    short = a.length < b.length ? a : b;

    for (let i = 0; i < short.length; i++) {
      let charA = a[i];
      let charB = b[i];
      if (isAlphaNum(charA) && !isAlphaNum(charB)) return 1;
      else if (!isAlphaNum(charA) && isAlphaNum(charB)) return -1;
      else if (charA < charB) return -1;
      else if (charB < charA) return 1;
    }

    return a.length < b.length ? -1 : a.length === b.length ? 0 : 1;
  });

  // Insert glossary index headings
  // Index heading element format: <div class="index-heading">B</div>
  function createIndexHeading(textContent) {
    const div = document.createElement("div");
    div.classList.add("index-heading");
    div.textContent = textContent;
    return div;
  }

  const temp = [];

  glossaryIndexEntries.reduce((accum, entry) => {
    const textContent = entry.textContent;
    const leadChar = /[`"']/.test(textContent[0]) ? textContent[1] : textContent[0];
    if (leadChar !== accum) {
      if (!isAlphaNum(leadChar)) temp.push(createIndexHeading("#"));
      else if (isNum(leadChar)) temp.push(createIndexHeading("0-9"));
      else temp.push(createIndexHeading(leadChar.toUpperCase()));
    }
    temp.push(entry);
    return isNum(leadChar) ? "0" : leadChar;
  }, "init");

  // Populate the glossary index with proper content
  const glossaryIndex = document.querySelector(".glossary-index");
  temp.forEach(entry => glossaryIndex.appendChild(entry));
}

/* **DEPRECATED MECHANISM REPLACED BY CSS MULTI-COLUMN LAYOUT MODULE**
// Create and add an event listener on window resize event to update the glossary index layout to fit screen width. Immediately invoke the function once (on page load)
function updateGlossaryIndexLayout() {
  // Format for column elements: <div class="index-col" style="width: 33.3%">
  function createColumnElement(widthPercent) {
    const div = document.createElement("div");
    div.classList.add("index-col");
    div.setAttribute("style", `width: ${widthPercent}%`);
    return div;
  }

  const container = document.querySelector(".glossary-index");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  const containerWidth = container.offsetWidth;
  const columnCount = Math.floor(containerWidth / 300);
  const entriesPerColumn = Math.floor(glossaryIndexEntries.length / columnCount);
  for (let i = 0; i < columnCount; i++) {
    const col = createColumnElement(100 / columnCount);
    const loopHighBound = i === columnCount - 1 ? glossaryIndexEntries.length : entriesPerColumn * (i + 1);
    for (let x = i * entriesPerColumn; x < loopHighBound; x++) col.appendChild(glossaryIndexEntries[x]);
    container.appendChild(col);
  }
}
*/

function generateTOCs() {
  // Create and insert a 'div.topic-toc' (a table of content) in each 'div.section'
  sections.forEach(section => {
    if (section.id === "glossary") return;

    // Format: <div class="topic topic-toc">
    const topicTOC = document.createElement("div");
    topicTOC.classList.add("topic", "topic-toc");

    // Format: <a class="topic-toc-heading h1"  id="subject-toc" href="#subject-toc">Table of Contents</a>
    const TOCHeading = document.createElement("a");
    TOCHeading.className = "topic-toc-heading h1";
    TOCHeading.textContent = "Table of Contents";
    TOCHeading.id = section.id + "-toc";
    TOCHeading.setAttribute("href", "#" + TOCHeading.id);
    topicTOC.appendChild(TOCHeading);

    section.querySelectorAll("[id]").forEach(topic => {
      const clone = topic.cloneNode(true);
      clone.removeAttribute("id");
      clone.className = clone.className + "-toc";
      topicTOC.appendChild(clone);
    });

    section.insertAdjacentElement("afterbegin", topicTOC);
  });

  // Create and return an object containing a table of content for each 'section' page/view's sidebar as the returned object's properties
  const result = {};
  sections.forEach(section => {
    result[section.id] = document.createElement("div");
    result[section.id].className = "sidebar-toc";
    section.querySelectorAll("[id]").forEach(topic => {
      const clone = topic.cloneNode(true);
      clone.removeAttribute("id");
      clone.className = clone.className + "-toc";
      result[section.id].appendChild(clone);
    });
  });
  result.notFound = document.createElement("div");
  result.notFound.className = "sidebar-toc";
  return result;
}

function updateTOC(sectionName) {
  document.querySelector(".sidebar-content").replaceChild(tocs[sectionName], document.querySelector(".sidebar-toc"));
}

function insertHeadingHrefs() {
  const headings = document.querySelectorAll("a[id]");
  headings.forEach(heading => heading.setAttribute("href", "#" + heading.id));
}
