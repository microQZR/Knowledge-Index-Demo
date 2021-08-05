// Hides the sidebar when invoked
function hideSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const showButton = document.querySelector(".sidebar-show-control");
  sidebar.style.minWidth = "0";
  sidebar.style.width = "0";
  sidebar.style.marginRight = "0";
  mainContent.style.width = "100%";
  mainContent.style.maxWidth = "none";
  showButton.style.display = "initial";
}

// Shows the sidebar when invoked
function showSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const showButton = document.querySelector(".sidebar-show-control");
  sidebar.style.minWidth = "var(--sidebar-min-width)";
  sidebar.style.width = "20%";
  sidebar.style.marginRight = "2rem";
  mainContent.style.width = "80%";
  mainContent.style.maxWidth = "calc(100% - var(--sidebar-min-width))";
  showButton.style.display = "none";
}

// Shows the navbar dropdown
function showNavDropdown() {
  document.querySelector(".dropdown").style.display = "block";
  document.querySelector(".sidebar").style.zIndex = -1;
  document.querySelector(".dropdown-toggle").onclick = hideNavDropdown;
  document.querySelector("main").addEventListener("click", hideNavDropdown);
}

// Hides the navbar dropdown
function hideNavDropdown() {
  document.querySelector(".dropdown").style.display = "none";
  document.querySelector(".sidebar").style.zIndex = "auto";
  document.querySelector(".dropdown-toggle").onclick = showNavDropdown;
  document.querySelector("main").removeEventListener("click", hideNavDropdown);
}

// Switches the glossary view to show sections
function glossarySectionsSelect() {
  document.querySelector(".glossary-index").classList.add("none");
  document.querySelector(".glossary-sections").classList.remove("none");
  document.querySelector(".glossary-sections-btn").classList.add("active");
  document.querySelector(".glossary-index-btn").classList.remove("active");
}

// Switches the glossary view to show the index
function glossaryIndexSelect() {
  document.querySelector(".glossary-index").classList.remove("none");
  document.querySelector(".glossary-sections").classList.add("none");
  document.querySelector(".glossary-sections-btn").classList.remove("active");
  document.querySelector(".glossary-index-btn").classList.add("active");
}

function hideSidebarWithoutTransition() {
  document.querySelector(".sidebar").style.transition = "none";
  document.querySelector(".main-content").style.transition = "none";
  hideSidebar();
  setTimeout(() => {
    document.querySelector(".sidebar").style.transition = "500ms";
    document.querySelector(".main-content").style.transition = "500ms";
  }, 0);
}

// Attaching all initial event listeners
document.querySelector(".dropdown-toggle").onclick = showNavDropdown;
document.querySelector(".sidebar-hide-control").onclick = hideSidebar;
document.querySelector(".sidebar-show-control").onclick = showSidebar;
document.querySelector(".glossary-sections-btn").onclick = glossarySectionsSelect;
document.querySelector(".glossary-index-btn").onclick = glossaryIndexSelect;

// JS media queries
const mediaQueryList = window.matchMedia("(max-width: 768px)");
mediaQueryList.addEventListener("change", e => {
  if (e.matches) hideSidebar();
});

//Immediately updates the UI on page load if media query is satisfied.
if (mediaQueryList.matches) hideSidebarWithoutTransition();
