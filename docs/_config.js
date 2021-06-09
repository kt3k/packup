import lume from "lume/mod.js";

const site = lume();

site.copy("logo.png");
site.copy("script.js");
site.copy("styles.css");
site.copy("markdown.css");

export default site;
