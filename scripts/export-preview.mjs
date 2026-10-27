import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist/site");
await fs.mkdir(output, { recursive: true });
const base = process.env.PROTOTYPE_BASE || "/";
const built = path.join(root, "dist/client/assets");
const files = await fs.readdir(built);
let js = await fs.readFile(path.join(built, files.find((name) => /^index-.*\.js$/.test(name))), "utf8");
let css = await fs.readFile(path.join(built, files.find((name) => /^index-.*\.css$/.test(name))), "utf8");
const assets = {};
for (const name of ["qifei-logo.png", "qifei-background.png", "kml_avator.png", ...Array.from({ length: 9 }, (_, i) => `frame-thumbnails/frame-${String(i + 1).padStart(2, "0")}.jpg`), ...Array.from({ length: 9 }, (_, i) => ["jpg", "mp4"].map((ext) => `storyboard-videos/video-${String(i + 1).padStart(2, "0")}.${ext}`)).flat()]) {
  const mime = name.endsWith(".png") ? "image/png" : name.endsWith(".mp4") ? "video/mp4" : "image/jpeg";
  const data = `data:${mime};base64,${(await fs.readFile(path.join(root, "public/assets", name))).toString("base64")}`;
  const url = `/assets/${name}`;
  if (name.includes("/")) assets[url] = data;
  else {
    js = js.replaceAll(`${base}assets/${name}`, data);
    css = css.replaceAll(`${base}assets/${name}`, data);
    js = js.replaceAll(url, data);
    css = css.replaceAll(url, data);
  }
}
const script = `globalThis.__FRAME_PREVIEW_ASSETS__=${JSON.stringify(assets)};\n${js}`.replaceAll("</script", "<\\/script");
const html = `<!doctype html>
<html lang="zh-CN">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="theme-color" content="#eef6ff" /><title>智能抽帧生产 V1.1</title><style>${css.replaceAll("</style", "<\\/style")}</style></head>
<body><div id="root"></div><script>${script}</script></body>
</html>
`;
await fs.writeFile(path.join(output, "index.html"), html);

const sourceFiles = ["package.json", "index.html", "src/main.jsx", "src/App.jsx", "src/styles.css", "vite.config.mjs", "scripts/export-preview.mjs"];
const languages = { ".json": "json", ".html": "html", ".jsx": "jsx", ".css": "css", ".mjs": "javascript", ".js": "javascript" };
const sections = ["# 智能抽帧生产 V1.1 原型源码", "", "> React + Vite 原型。离线发布包直接打开 index.html；桌面文件名为 智能抽帧生产 V1.1.html。", "", "## 源码目录", "", ...sourceFiles.map((name) => `- \`${name}\``), ""];
for (const name of sourceFiles) {
  sections.push(`## ${name}`, "", `\`\`\`${languages[path.extname(name)]}`, (await fs.readFile(path.join(root, name), "utf8")).trimEnd(), "```", "");
}
await fs.writeFile(path.join(root, "docs/源码.md"), sections.join("\n"));
console.log(`Exported self-contained prototype to ${output}`);
