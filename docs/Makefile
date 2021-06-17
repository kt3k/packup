LUME=deno run --unstable --allow-read --allow-write --allow-net https://deno.land/x/lume@v0.22.5/cli.js
TWD=deno run -A https://deno.land/x/twd@v0.3.1/cli.ts
DEPLOY_DIR=deno run -A https://deno.land/x/deploy_dir@v0.3.2/cli.ts
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

# Create script for Deno Deploy
d:
	$(MAKE) clean
	$(MAKE) build
	$(DEPLOY_DIR) _site -o deploy.js -y --cache /monaco-editor:max-age=86400
	ls -lh deploy.js

.PHONY: dev build clean style style-w d
