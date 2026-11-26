const DB_NAME = "gev-virtual-tour";
const DB_VERSION = 1;
const $ = (selector) => document.querySelector(selector);
let leftViewer = null;
let rightViewer = null;
let urls = [];

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("scenes")) db.createObjectStore("scenes", { keyPath: "id" });
      if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function requestValue(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function disposeViewers() {
  if (leftViewer) leftViewer.destroy();
  if (rightViewer) rightViewer.destroy();
  leftViewer = rightViewer = null;
  urls.forEach(URL.revokeObjectURL);
  urls = [];
}
function optionLabel(scene) { return scene.title || "Panorama"; }
function buildViewer(element, scene) {
  const url = URL.createObjectURL(scene.image);
  urls.push(url);
  return window.pannellum.viewer(element, {
    type: "equirectangular",
    panorama: url,
    autoLoad: true,
    showControls: true,
    showFullscreenCtrl: false,
    hfov: 100,
    title: optionLabel(scene)
  });
}
function syncCamera(source, target) {
  if (!source || !target) return;
  target.setPitch(source.getPitch(), 0);
  target.setYaw(source.getYaw(), 0);
  target.setHfov(source.getHfov(), 0);
}
function bindSync(source, target) {
  ["mouseup", "touchend", "zoomchange"].forEach((eventName) => {
    source.on(eventName, () => syncCamera(source, target));
  });
}
async function renderComparison() {
  const db = await openDb();
  const scenes = (await requestValue(db.transaction("scenes").objectStore("scenes").getAll()))
    .sort((a, b) => a.createdAt - b.createdAt);
  db.close();
  const leftSelect = $("#compare-left");
  const rightSelect = $("#compare-right");
  leftSelect.replaceChildren();
  rightSelect.replaceChildren();
  scenes.forEach((scene) => {
    leftSelect.add(new Option(optionLabel(scene), scene.id));
    rightSelect.add(new Option(optionLabel(scene), scene.id));
  });
  if (scenes.length < 2) {
    $("#compare-status").textContent = "Tambahkan minimal dua panorama untuk membandingkan.";
    disposeViewers();
    return;
  }
  if (!rightSelect.value || rightSelect.value === leftSelect.value) rightSelect.selectedIndex = 1;
  const left = scenes.find((scene) => scene.id === leftSelect.value) || scenes[0];
  const right = scenes.find((scene) => scene.id === rightSelect.value) || scenes[1];
  disposeViewers();
  leftViewer = buildViewer("compare-left-view", left);
  rightViewer = buildViewer("compare-right-view", right);
  bindSync(leftViewer, rightViewer);
  bindSync(rightViewer, leftViewer);
  $("#compare-status").textContent = "Kamera tersinkronisasi: arah pandang dan zoom bergerak bersama.";
}
document.addEventListener("DOMContentLoaded", () => {
  const panel = $("#compare-panel");
  $("#compare-toggle").addEventListener("click", async () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) await renderComparison();
    else disposeViewers();
  });
  $("#compare-left").addEventListener("change", renderComparison);
  $("#compare-right").addEventListener("change", renderComparison);
  window.addEventListener("beforeunload", disposeViewers);
});
