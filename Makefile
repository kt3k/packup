test:
	deno test --unstable --allow-read --allow-write --allow-run=deno --allow-net=:4567 --coverage=coverage

cov:
	deno coverage coverage --lcov > coverage/lcov.info
	genhtml -o coverage/html coverage/lcov.info

fmt:
	deno fmt *.ts *.md examples

lint:
	deno lint

ex-build:
	deno run --unstable --allow-read=. --allow-write=dist cli.ts build examples/simple/index.html

ex-serve:
	deno run --unstable --allow-read=. --allow-net=:1234 cli.ts serve examples/simple/index.html
