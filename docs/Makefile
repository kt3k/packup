LUME=deno run --unstable --allow-read --allow-write https://deno.land/x/lume@v0.20.2/cli.js
TWD=deno run -A https://deno.land/x/twd@v0.3.1/cli.ts
DEPLOY_DIR=deno run -A https://deno.land/x/deploy_dir@v0.2.3/cli.ts
build:
	$(LUME)

clean:
	rm -rf _site

style:
	$(TWD) _includes/layout.njk -o styles.css

style-w:
	$(TWD) _includes/layout.njk -o styles.css -w

deploy.js:
	$(DEPLOY_DIR) _site -o deploy.js -y
	ls -lh deploy.js

.PHONY: build clean deploy.js
