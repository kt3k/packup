test:
	deno test --coverage=coverage

cov:
	deno coverage coverage --lcov > coverage/lcov.info
	genhtml -o coverage/html coverage/lcov.info

simple-example:
	deno run --allow-read=. --allow-write=dist cli.ts build examples/simple/index.html
