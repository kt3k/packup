---
title: Type Checking
weight: 2
---

# Type Checking

We recommend [the official Deno VSCode extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno) for type checking your frontend code. Optionally you can use any LSP compliant editors. See [Editors and IDEs section](https://deno.land/manual/getting_started/setup_your_environment#editors-and-ides) of Deno Manual for more details.

You can also use `deno cache` command for type checking your frontend code with the below configuration.

## TypeScript Configuration

To use the type checker smoothly with your frontend code, you need `tsconfig.ts` set up like the below.

```json
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["esnext", "dom", "dom.iterable", "dom.asynciterable"]
  }
}
```

See the [Using the "lib" property](https://deno.land/manual/typescript/configuration#using-the-quotlibquot-property) section of Deno Manula for more details.
