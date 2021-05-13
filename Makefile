OPTS=--unstable --allow-read=.,$(shell which deno) --allow-write --allow-net=:1234,registry.npmjs.org --allow-env --allow-run
test:
	deno test --unstable --allow-read --allow-write --allow-run=$(shell which deno) --allow-net=:4567 --coverage=coverage

cov:
	deno coverage coverage --lcov > coverage/lcov.info
	genhtml -o coverage/html coverage/lcov.info

fmt:
	deno fmt *.ts *.md examples

lint:
	deno lint

esbuild.wasm:
	wget https://unpkg.com/esbuild-wasm@0.11.19/esbuild.wasm

esbuild_wasm.js: esbuild.wasm
	deno run -A make_esbuild_wasm.js

ex-build:
	deno run --unstable --allow-read=.,$(shell which deno) --allow-write=dist --allow-run=$(shell which deno) cli.ts build examples/simple/index.html

ex-serve:
	deno run --unstable --allow-read=.,$(shell which deno) --allow-net=:1234 --allow-run=$(shell which deno) cli.ts serve examples/simple/index.html

ex-serve1:
	deno run --unstable --allow-read=.,$(shell which deno) --allow-net=:1234 --allow-run=$(shell which deno) cli.ts serve examples/with-simple-assets/index.html

ex2:
	deno run $(OPTS) cli.ts serve examples/with-imports/index.html

ex2-build:
	deno run $(OPTS) cli.ts build examples/with-imports/index.html

ex2-swc:
	deno run $(OPTS) cli.ts serve examples/with-imports/index.html --bundler swc
