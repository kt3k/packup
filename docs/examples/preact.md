---
title: Preact Example
weight: 2
---

# Preact Example

This example shows how to use [Preact](https://preactjs.com/) with [Preact-Router](https://github.com/preactjs/preact-router) and [HTM](https://github.com/developit/htm) in packup.

We recommend [esm.sh](https://esm.sh/) for loading Preact, HTM and their related modules.

`index.html`

```html
<html>
  <head>
    <title>with-simple-assets document</title>
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <div id="main"></div>
    <script src="js/script.js"></script>
  </body>
</html>
```

`js/script.js`

```js
import { Router } from 'https://esm.sh/preact-router@3.2.1'
import { Link } from 'https://esm.sh/preact-router@3.2.1/match'
import { render } from 'https://esm.sh/preact@10.5.14'
import { html } from 'https://esm.sh/htm@3.1.0/preact'

function App() {
    return html`
        <nav>
            <${Link} activeClassName=active href="/">Home<//>${" "}
            <${Link} activeClassName=active href="/about">About<//>${" "}
            <${Link} activeClassName=active href="/users">Users<//>
        </nav>

        <${Router}>
            <${Home} default />
            <${About} path="/about" />
            <${Users} path="/users" />
        <//>
    `
}

function Home() {
  return html`<h2>Home</h2>`
}

function About() {
  return html`<h2>About</h2>`
}

function Users() {
  return html`<h2>Users</h2>`
}

render(html`<${App} />`, document.getElementById('main'))
```

`tsconfig.json` is not absolutely required for bundling frontend assets, and actually packup doesn't use it internally, but it's recommend for better development experience with editors.
