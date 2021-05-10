test:
	deno test --unstable --allow-read --allow-write --allow-run=$(shell which deno) --allow-net=:4567,unpkg.com --coverage=coverage

cov:
	deno coverage coverage --lcov > coverage/lcov.info
	genhtml -o coverage/html coverage/lcov.info

fmt:
	deno fmt *.ts *.md examples

lint:
	deno lint

ex-build:
	deno run --unstable --allow-read=.,$(shell which deno) --allow-write=dist --allow-run=$(shell which deno) cli.ts build examples/simple/index.html

ex-serve:
	deno run --unstable --allow-read=.,$(shell which deno) --allow-net=:1234 --allow-run=$(shell which deno) cli.ts serve examples/simple/index.html

ex-serve1:
	deno run --unstable --allow-read=.,$(shell which deno) --allow-net=:1234,unpkg.com --allow-run=$(shell which deno) cli.ts serve examples/with-simple-assets/index.html

ex2:
	deno run --unstable --allow-read=.,$(shell which deno) --allow-net=:1234,unpkg.com --allow-run=$(shell which deno) cli.ts serve examples/with-imports/index.html

ex2-swc:
	deno run --unstable --allow-read=.,$(shell which deno) --allow-net=:1234,unpkg.com --allow-run=$(shell which deno) cli.ts serve examples/with-imports/index.html --bundler swc
