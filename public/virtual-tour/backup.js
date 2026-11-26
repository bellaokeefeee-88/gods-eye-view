const DB_NAME = "gev-virtual-tour";
const DB_VERSION = 1;
const $ = (selector) => document.querySelector(selector);

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
function notify(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3000);
}
function safeFileName(value) {
  return String(value || "panorama").normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "panorama";
}
async function exportBackup() {
  if (!window.JSZip) { notify("Library ZIP belum tersedia. Periksa koneksi internet."); return; }
  const db = await openDb();
  const tx = db.transaction(["scenes", "settings"], "readonly");
  const scenes = await requestValue(tx.objectStore("scenes").getAll());
  const floorSetting = await requestValue(tx.objectStore("settings").get("floor-plan"));
  const metadataSetting = await requestValue(tx.objectStore("settings").get("building-metadata"));
  db.close();
  if (!scenes.length) { notify("Belum ada panorama untuk dicadangkan."); return; }
  const zip = new window.JSZip();
  const imageFolder = zip.folder("panoramas");
  const manifest = {
    format: "GOD-EYE-VIEW-PANORAMA-BACKUP",
    version: 1,
    exportedAt: new Date().toISOString(),
    building: metadataSetting?.value || {},
    scenes: []
  };
  scenes.sort((a, b) => a.createdAt - b.createdAt);
  scenes.forEach((scene, index) => {
    const ext = scene.image?.type?.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const fileName = String(index + 1).padStart(3, "0") + "-" + safeFileName(scene.title) + "." + ext;
    imageFolder.file(fileName, scene.image);
    manifest.scenes.push({
      id: scene.id, title: scene.title, image: "panoramas/" + fileName,
      hotspots: scene.hotspots || [], floorPin: scene.floorPin || null,
      createdAt: scene.createdAt
    });
  });
  if (floorSetting?.value) {
    const floorType = floorSetting.value.type?.split("/")[1] || "png";
    zip.file("floor-plan." + floorType, floorSetting.value);
    manifest.floorPlan = "floor-plan." + floorType;
  }
  zip.file("project.json", JSON.stringify(manifest, null, 2));
  zip.file("README.txt", "Cadangan lokal GOD EYE VIEW Virtual Tour 360°.\nUntuk memulihkan proyek, impor project.json dan file gambar melalui fitur impor yang akan disediakan pada versi berikutnya.\nFoto dan metadata tetap diproses di browser ini; file ZIP dibuat secara lokal.");
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "gev-panorama-backup-" + new Date().toISOString().slice(0, 10) + ".zip";
  anchor.click();
  URL.revokeObjectURL(url);
  notify("Cadangan ZIP berhasil dibuat.");
}
document.addEventListener("DOMContentLoaded", () => {
  $("#backup-export").addEventListener("click", () => exportBackup().catch((error) => {
    console.error(error);
    notify("Ekspor gagal. Periksa ruang penyimpanan browser.");
  }));
});
