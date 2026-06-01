import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignoredDirs = new Set([".git", "node_modules"]);
const errors = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function relative(file) {
  return path.relative(root, file) || ".";
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function idsIn(html) {
  return new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
}

function htmlFiles() {
  return walk(root).filter((file) => file.endsWith(".html"));
}

function publishableIndexPages() {
  return htmlFiles()
    .filter((file) => path.basename(file) === "index.html")
    .map((file) => path.dirname(relative(file)))
    .map((dir) => (dir === "." ? "" : `${dir.replaceAll(path.sep, "/")}/`))
    .sort();
}

function pageFileFromKey(page) {
  return page ? path.join(root, page, "index.html") : path.join(root, "index.html");
}

function pageKeyFromFile(file) {
  const page = relative(file).replaceAll(path.sep, "/");
  if (page === "index.html") return "";
  if (!page.endsWith("/index.html")) return null;
  return page.replace(/index\.html$/, "");
}

function pageKeyFromHref(file, href) {
  if (!href || href.startsWith("data:")) return null;
  if (/^(https?:|mailto:|tel:)/.test(href)) return null;

  const [target] = href.split("#");
  if (!target) return pageKeyFromFile(file);

  const resolved = path.normalize(path.join(path.dirname(file), target));
  const statPath = fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()
    ? path.join(resolved, "index.html")
    : resolved;

  if (!statPath.endsWith("index.html") || !fs.existsSync(statPath)) return null;
  return pageKeyFromFile(statPath);
}

function linkedPageKeys(file, html) {
  return [...html.matchAll(/\shref="([^"]+)"/g)]
    .map((match) => pageKeyFromHref(file, match[1]))
    .filter((page) => page !== null);
}

function checkHtmlScripts(file, html) {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .join("\n");

  if (!scripts.trim()) return;

  try {
    new Function(scripts);
  } catch (error) {
    errors.push(`${relative(file)} has invalid inline script: ${error.message}`);
  }
}

function hasTag(html, pattern) {
  return pattern.test(html);
}

function checkHtmlMetadata(file, html) {
  const page = relative(file);
  const required = [
    ["doctype", /^<!doctype html>/i],
    ["html lang=\"ru\"", /<html\s+lang="ru">/],
    ["viewport meta", /<meta\s+name="viewport"\s+content="width=device-width,\s*initial-scale=1">/],
    ["title", /<title>[^<]+<\/title>/],
    ["description meta", /<meta\s+name="description"\s+content="[^"]+">/],
    ["theme-color meta", /<meta\s+name="theme-color"\s+content="[^"]+">/],
    ["favicon", /<link\s+rel="icon"\s+type="image\/png"\s+href="[^"]+">/]
  ];

  for (const [label, pattern] of required) {
    if (!hasTag(html, pattern)) {
      errors.push(`${page} is missing ${label}`);
    }
  }

  if (!/<main[\s>]/.test(html)) {
    errors.push(`${page} is missing main landmark`);
  }

  if (page !== "404.html") {
    if (!/<a\s+class="skip-link"\s+href="#content">К содержанию<\/a>/.test(html)) {
      errors.push(`${page} is missing skip link`);
    }

    if (!/<main\s+id="content"[\s>]/.test(html)) {
      errors.push(`${page} main landmark must use id="content"`);
    }
  }
}

function checkPageStructure(file, html) {
  const page = relative(file);
  if (page === "404.html") return;

  if (!/<nav[\s>]/.test(html)) {
    errors.push(`${page} is missing navigation`);
  }

  if (!/<footer[\s>]/.test(html)) {
    errors.push(`${page} is missing footer`);
  }

  if (!/<footer[\s\S]*?<nav[\s\S]*?<\/footer>/.test(html)) {
    errors.push(`${page} footer must include quick links`);
  }

  if (!/<script\s+src="[^"]*assets\/site\.js"><\/script>/.test(html)) {
    errors.push(`${page} must register the shared site script`);
  }
}

function checkLocalReference(file, html, attribute, link) {
  if (!link || link.startsWith("data:")) return;
  if (/^(https?:|mailto:|tel:)/.test(link)) return;

  const ownIds = idsIn(html);

  if (link.startsWith("#")) {
    const anchor = link.slice(1);
    if (anchor && !ownIds.has(anchor)) {
      errors.push(`${relative(file)} has missing anchor ${link}`);
    }
    return;
  }

  const [target, anchor] = link.split("#");
  const resolved = path.normalize(path.join(path.dirname(file), target));

  if (!fs.existsSync(resolved)) {
    errors.push(`${relative(file)} has missing ${attribute} ${link} -> ${relative(resolved)}`);
    return;
  }

  if (anchor && resolved.endsWith(".html")) {
    const targetIds = idsIn(read(resolved));
    if (!targetIds.has(anchor)) {
      errors.push(`${relative(file)} points to missing anchor ${link}`);
    }
  }
}

function checkHtmlLinks(file, html) {
  for (const match of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    checkLocalReference(file, html, match[1], match[2]);
  }
}

function checkManifest() {
  const manifestPath = path.join(root, "site.webmanifest");
  if (!fs.existsSync(manifestPath)) {
    errors.push("site.webmanifest is missing");
    return;
  }

  let manifest;
  try {
    manifest = JSON.parse(read(manifestPath));
  } catch (error) {
    errors.push(`site.webmanifest is invalid JSON: ${error.message}`);
    return;
  }

  for (const icon of manifest.icons || []) {
    const iconPath = path.join(root, icon.src || "");
    if (!fs.existsSync(iconPath)) {
      errors.push(`site.webmanifest points to missing icon ${icon.src}`);
    }
  }
}

function checkServiceWorker() {
  const workerPath = path.join(root, "sw.js");
  const siteScriptPath = path.join(root, "assets", "site.js");

  if (!fs.existsSync(workerPath)) {
    errors.push("sw.js is missing");
    return;
  }

  if (!fs.existsSync(siteScriptPath)) {
    errors.push("assets/site.js is missing");
  }

  const worker = read(workerPath);
  const cacheMatch = worker.match(/const CACHE_PATHS = \[([\s\S]*?)\];/);
  if (!cacheMatch) {
    errors.push("sw.js is missing CACHE_PATHS");
    return;
  }

  const cachedPaths = [...cacheMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  const cachedSet = new Set(cachedPaths);

  for (const cachedPath of cachedPaths) {
    if (cachedPath === "./") continue;
    const localPath = path.join(root, cachedPath.replace(/^\.\//, ""));
    if (!fs.existsSync(localPath)) {
      errors.push(`sw.js caches missing file ${cachedPath}`);
    }
  }

  for (const page of publishableIndexPages()) {
    const cachePath = page ? `./${page}index.html` : "./index.html";
    if (!cachedSet.has(cachePath)) {
      errors.push(`sw.js CACHE_PATHS is missing ${cachePath}`);
    }
  }
}

function checkSitemap() {
  const sitemapPath = path.join(root, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    errors.push("sitemap.xml is missing");
    return;
  }

  const sitemap = read(sitemapPath);
  const urls = [...sitemap.matchAll(/<loc>https:\/\/panscer-arch\.github\.io\/Yana\/([^<]*)<\/loc>/g)]
    .map((match) => match[1])
    .sort();
  const urlSet = new Set(urls);

  for (const url of urls) {
    const localPath = url ? path.join(root, url, "index.html") : path.join(root, "index.html");
    if (!fs.existsSync(localPath)) {
      errors.push(`sitemap.xml points to missing page /${url}`);
    }
  }

  for (const page of publishableIndexPages()) {
    if (!urlSet.has(page)) {
      errors.push(`sitemap.xml is missing publishable page /${page}`);
    }
  }
}

function checkReachablePages() {
  const expectedPages = publishableIndexPages();
  const expectedSet = new Set(expectedPages);
  const visited = new Set();
  const queue = [""];

  while (queue.length) {
    const page = queue.shift();
    if (visited.has(page) || !expectedSet.has(page)) continue;
    visited.add(page);

    const file = pageFileFromKey(page);
    const html = read(file);
    for (const nextPage of linkedPageKeys(file, html)) {
      if (expectedSet.has(nextPage) && !visited.has(nextPage)) {
        queue.push(nextPage);
      }
    }
  }

  for (const page of expectedPages) {
    if (!visited.has(page)) {
      errors.push(`/${page} is not reachable from the home page`);
    }
  }
}

function checkRequiredPublishingFiles() {
  for (const file of [".nojekyll", "404.html", "robots.txt", "sitemap.xml", "site.webmanifest"]) {
    if (!fs.existsSync(path.join(root, file))) {
      errors.push(`${file} is missing`);
    }
  }
}

for (const file of htmlFiles()) {
  const html = read(file);
  checkHtmlMetadata(file, html);
  checkPageStructure(file, html);
  checkHtmlScripts(file, html);
  checkHtmlLinks(file, html);
}

checkManifest();
checkServiceWorker();
checkSitemap();
checkReachablePages();
checkRequiredPublishingFiles();

if (errors.length) {
  console.error("Site check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Site check passed.");
