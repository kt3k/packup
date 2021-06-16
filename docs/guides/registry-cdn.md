---
title: Registries & CDNs
weight: 0
---

# Registries and CDNs

One of the unique features of `packup` is that it resolves the module in the same way as [Deno](https://deno.land/). That means you can use `http(s) import` like the below.

```ts
import React from "https://esm.sh/react";
```

On the other hand, it also means you can't use `npm` modules as it is. Instead you need to use these modules via special registries or CDNs which transforms the npm module into [ES Module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

This section shows the list of registries and CDNs which can be used with packup.

## `esm.sh`

`esm.sh` transforms any npm modules automatically into ES Modules. So you can try any npm module with the url like `https://esm.sh/<npm-module-name>` e.g. `https://esm.sh/react`. It also serves type declaration through `X-TypeScript-Types` header. So you can even type check the exported APIs when the CDN find types.

`esm.sh` also provides the Node.js polyfill for Deno if the user agent is Deno.

You can load modules like React, React Router, styled-components, twind, etc.

```ts
import React from "https://esm.sh/react";
import ReactDOM from "https://esm.sh/react-dom";
import { BrowserRouter, Link, Route } from "https://esm.sh/react-router";
import styled from "https://esm.sh/styled-components";
import { tw } from "https://esm.sh/twind";
```

## Skypack

Skypack is very similar to esm.sh. It automatically converts npm modules into ES Modules. It provides types via `X-TypeScript-Types`. So you can type check the exported APIs. Skypack also provides Node.js native API polyfills for Deno.

```ts
import React from "https://cdn.skypack.dev/react";
import ReactDOM from "https://cdn.skypack.dev/react-dom";
import styled from "https://cdn.skypack.dev/styled-components";
import { tw } from "https://cdn.skypack.dev/twind";
```

## `dev.jspm.io`

`dev.jspm.io` is also similar to `esm.sh` and Skypack, but it doesn't provide types via `X-TypeScript-Types`. It doesn't provide Node.js polyfill for Deno, but rather it provides Node.js polyfill for browsers.

TODO: Add example modules

## `unpkg.com`

`unpkg.com` provides the npm modules as is. So in many cases the modules are unusuable from packup or Deno, but many npm modules often provides [UMD (Universal Module Definition)](https://github.com/umdjs/umd) format of the module, or ES Module version of the module, which are often usable from Deno.

TODO: Add example modules

## `deno.land/std`

`deno.land/std` serves the Standard Modules of Deno. These are usable from `packup` unless it depends on Deno namespace APIs.

TODO: Add example modules

## `deno.land/x`

`deno.land/x` is the official 3rd party module registry for Deno. Because packup resolves the module in the compatible way of Deno, you can at least resolve these modules, and they might be usable if they don't depends on Deno namespace APIs.

TODO: Add example modules
