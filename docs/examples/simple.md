---
title: Simple Example
weight: 0
---

# A simple example

This example shows the basic usage of including CSS file and JavaScript file in your page.

[Source](https://github.com/kt3k/packup/tree/main/examples/with-imports)

`index.html`

```html
<html>
  <head>
    <title>with-simple-assets document</title>
    <link rel="stylesheet" href="css/style.css" />
    <script src="js/script.js"></script>
  </head>
  <body>
    <h1>Hey!</h1>
  </body>
</html>
```

`css/style.css`

```
* {
  margin: 0;
  padding: 0;
}

body {
  background-color: yellow;
}
```

`js/script.js`

```js
import { foo } from "./foo.js";

window.addEventListener("DOMContentLoaded", () => {
  foo();
});
```

`js/foo.js`

```js
export function foo() {
  console.log("hello from foo.js");
}
```
