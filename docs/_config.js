import lume from "https://deno.land/x/lume@v0.22.5/mod.js";

const site = lume();

site.copy("logo.png");
site.copy("script.js");
site.copy("styles.css");
site.copy("default.css");
site.copy("markdown.css");
site.copy("monaco-editor");

export default site;
