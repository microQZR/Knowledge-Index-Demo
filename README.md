# Knowledge Index (public demo)

A web application with a minimalist design serving as a personal notebook/reference guide about all things related to programming and computers.
<br>
<br>

## Features

- Custom client-side routing mechanism implemented using the HTML Spec's [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API). (Akin to [React Router](https://github.com/ReactTraining/react-router)) Requires only one HTTP request-response cycle on initial page load or manual page refresh. Subsequent path navigations handled client-side.
- A JavaScript-based, custom HTML templating engine auto-generates the glossary page and the tables of contents. The templating engine also converts the author-provided, concise-format markup content into an HTML5-compliant format and inserts appropriate `class` attributes for proper styling using CSS.
- Minimalist design.
<br>

## Files of Interest

- [index.html](index.html) : Target file to be served, holds all reading material.
- [virg-index.html](virg-index.html) : Baseline application scaffold without reading material.
- [template-index.html](template-index.html) : Application specific markup formatting reference/template.
<br>

## Live Demo

See a live demo of the application with some sample content [here](https://kindex.netlify.app/).
