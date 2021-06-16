test:
	deno run -A before_testing.ts
	deno test --unstable -A --coverage=coverage *_test.ts

cov:
	deno coverage coverage --lcov > coverage/lcov.info
	genhtml -o coverage/html coverage/lcov.info

fmt:
	deno fmt *.ts *.md examples

fmt-check:
	deno fmt --check *.ts *.md examples

lint:
	deno lint *.ts

ex-build:
	deno run --unstable -A cli.ts build examples/simple/index.html

ex-serve:
	deno run --unstable -A cli.ts serve examples/simple/index.html

ex2:
	deno run --unstable -A cli.ts serve --static-dir examples/static-dir/static examples/with-imports/index.html

ex2-o:
	deno run --unstable -A cli.ts serve -o --static-dir examples/static-dir/static examples/with-imports/index.html

ex2-debug:
	deno run --unstable -A cli.ts serve --log-level=debug --static-dir examples/static-dir/static examples/with-imports/index.html

ex2-build:
	deno run --unstable -A cli.ts build --static-dir examples/static-dir/static examples/with-imports/index.html

ex2-build-debug:
	deno run --unstable -A cli.ts build --log-level=debug --static-dir examples/static-dir/static examples/with-imports/index.html

ex-react:
	deno run --unstable -A cli.ts serve examples/react-simple/index.html

ex-rr:
	deno run --unstable -A cli.ts serve examples/react-router/index.html

ex-sc:
	deno run --unstable -A cli.ts serve examples/styled-components/index.html

d:
	$(MAKE) -C docs d
