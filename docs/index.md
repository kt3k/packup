---
title: Packup
layout: layout.njk
description: 📦 Zero-config web application packager for Deno 🦕
---

# Introduction

Packup is web application bundler for [Deno][Deno], inspired by [parcel][parcel]. Packup connects your assets such as html, css, javascript and bundles them into static files. It also serves them dynamically when in development.

## Features

- 📦 Bundles web application like [Parcel][Parcel].
- ✨ Supports TypeScript out of the box.
- 🦕 Deno-compatible ES Modules resolution.
- 💨 Fast build with [esbuild][esbuild]-wasm bundler.
- 🔩 Dev server builtin

Packup supports TypeScript out of the box, and provides type checked development environment along with [vscode deno extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno).

Packup doesn't support commonjs modules, instead it supports Deno compatible module resolution.

Packup uses [esbuild][esbuild] bundler internally to bundle your scripts, and it's very fast!

[parcel]: https://parceljs.org/
[esbuild]: https://esbuild.github.io/
[Deno]: https://deno.land/
