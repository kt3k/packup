---
title: React Example
weight: 0
---

# React example

```js
import React from "https://esm.sh/react@17.0.2";
import ReactDOM from "https://esm.sh/react-dom@17.0.2";
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
} from "https://esm.sh/react-router-dom@5.2.0";
import styled, {
  createGlobalStyle,
} from "https://esm.sh/styled-components@5.3.0";
import { css } from "https://esm.sh/@emotion/css@11.1.3";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`;

function App() {
  return (
    <Router>
      <GlobalStyle />
      <div>
        <Nav>
          <List>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/users">Users</Link>
            </li>
          </List>
        </Nav>

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

const List = styled.ul`
  display: flex;
  padding-inline-start: 0;

  li {
    list-style-type: none;
    margin-right: 8px;
  }
`;

const Nav = styled.nav`
  width: 100%;
  padding: 15px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #eee;
`;

const Main = styled.main`
  padding: 15px;
`;

function Home() {
  return (
    <Main>
      <Heading>Home</Heading>
      <p className={textStyle}>
        This text is styled by{" "}
        <a href="https://www.npmjs.com/package/@emotion/css/v/11.1.3">
          @emotion/css@11.1.3
        </a>
      </p>
      <p className={textStyle}>
        The heading is styled by{" "}
        <a href="https://www.npmjs.com/package/styled-components/v/5.3.0">
          styled-components@5.3.0
        </a>
      </p>
    </Main>
  );
}

function About() {
  return (
    <Main>
      <Heading>About</Heading>
      <p className={textStyle}>
        This text is styled by{" "}
        <a href="https://www.npmjs.com/package/@emotion/css/v/11.1.3">
          @emotion/css@11.1.3
        </a>
      </p>
      <p className={textStyle}>
        The heading is styled by{" "}
        <a href="https://www.npmjs.com/package/styled-components/v/5.3.0">
          styled-components@5.3.0
        </a>
      </p>
    </Main>
  );
}

function Users() {
  return (
    <Main>
      <Heading>Users</Heading>
      <p className={textStyle}>
        This text is styled by{" "}
        <a href="https://www.npmjs.com/package/@emotion/css/v/11.1.3">
          @emotion/css@11.1.3
        </a>
      </p>
      <p className={textStyle}>
        The heading is styled by{" "}
        <a href="https://www.npmjs.com/package/styled-components/v/5.3.0">
          styled-components@5.3.0
        </a>
      </p>
    </Main>
  );
}

const Heading = styled.h2`
  font-size: 24px;
  font-weight: 900;
  color: #500;
`;

const textStyle = css`
  font-size: 12px;
  color: #050;
`;

function main() {
  ReactDOM.render(<App />, document.querySelector("#main"));
}

addEventListener("DOMContentLoaded", () => {
  main();
});
```
