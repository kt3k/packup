LUME=deno run --unstable --allow-read --allow-write --allow-net https://deno.land/x/lume@v0.22.5/cli.js
TWD=deno run -A https://deno.land/x/twd@v0.3.1/cli.ts

dev:
	$(LUME) -s

build:
	$(LUME)

clean:
	rm -rf _site

style:
	$(TWD) _includes/layout.njk -o styles.css

style-w:
	$(TWD) _includes/layout.njk -o styles.css -w

d:
	$(MAKE) clean
	$(MAKE) build

.PHONY: dev build clean style style-w d
