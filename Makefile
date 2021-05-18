test:
	deno run -A before_testing.ts
	deno test --unstable -A --coverage=coverage

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
	deno run --unstable -A cli.ts build examples/simple/index.html

ex-serve:
	deno run --unstable -A cli.ts serve examples/simple/index.html

ex-serve1:
	deno run --unstable -A cli.ts serve examples/with-simple-assets/index.html

ex2:
	deno run --unstable -A cli.ts serve --log-level=debug examples/with-imports/index.html

ex2-build:
	deno run --unstable -A cli.ts build examples/with-imports/index.html

ex2-swc:
	deno run --unstable -A cli.ts serve examples/with-imports/index.html --bundler swc
