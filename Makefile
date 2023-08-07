ex-build:
	deno run -A cli.ts build examples/simple/index.html

ex-serve:
	deno run -A cli.ts serve examples/simple/index.html

ex2:
	deno run -A cli.ts serve --static-dir examples/static-dir/static examples/with-imports/index.html

ex2-o:
	deno run -A cli.ts serve -o --static-dir examples/static-dir/static examples/with-imports/index.html

ex2-debug:
	deno run -A cli.ts serve --log-level=debug --static-dir examples/static-dir/static examples/with-imports/index.html

ex2-build:
	deno run -A cli.ts build --static-dir examples/static-dir/static examples/with-imports/index.html

ex2-build-debug:
	deno run -A cli.ts build --log-level=debug --static-dir examples/static-dir/static examples/with-imports/index.html

ex-react:
	deno run -A cli.ts serve examples/react-simple/index.html

ex-rr:
	deno run -A cli.ts serve examples/react-router/index.html

ex-sc:
	deno run -A cli.ts serve -L debug examples/styled-components/index.html

publish-doc:
	$(MAKE) -C docs d
	git add docs/_site
	git commit -m "chore: update doc site"
