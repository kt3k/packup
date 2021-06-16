---
title: React Example
weight: 1
---

# React Example

This example shows how to use [React](https://reactjs.org/) with [React Router](https://reactrouter.com/) in packup.

We recommend [esm.sh](https://esm.sh/) for loading React and related modules.

You need to use `.tsx` (or `.jsx`) file extension for React scripts as they include JSX syntax.

`index.html`

```html
<html>
  <head>
    <title>with-simple-assets document</title>
    <link rel="stylesheet" href="css/style.css" />
    <script src="js/script.tsx"></script>
  </head>
  <body>
    <div id="main"></div>
  </body>
</html>
```

`js/script.tsx`

```ts
import React from "https://esm.sh/react@17.0.2";
import ReactDOM from "https://esm.sh/react-dom@17.0.2";
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
} from "https://esm.sh/react-router-dom@5.2.0";

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/users">Users</Link>
            </li>
          </ul>
        </nav>

        {
          /* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */
        }
        <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/users">
            <Users />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Home() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function Users() {
  return <h2>Users</h2>;
}

function main() {
  ReactDOM.render(React.createElement(App), document.querySelector("#main"));
}

addEventListener("DOMContentLoaded", () => {
  main();
});
```

`tsconfig.json` is not absolutely required for bundling frontend assets, and actually packup doesn't use it internally, but it's recommend for better development experience with editors.

`tsconfig.json`

```json
{
  "compilerOptions": {
    "lib": ["esnext", "dom"]
  }
}
```
