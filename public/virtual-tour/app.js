const DB_NAME = "gev-virtual-tour";
const DB_VERSION = 1;
const $ = (selector) => document.querySelector(selector);
let db;
let scenes = [];
let activeSceneId = null;
let viewer = null;
let objectUrls = [];
let hotspotMode = false;
let floorPlanUrl = null;
let metadata = { buildingName: "", latitude: "", longitude: "" };

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("scenes")) database.createObjectStore("scenes", { keyPath: "id" });
      if (!database.objectStoreNames.contains("settings")) database.createObjectStore("settings", { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function transaction(store, mode = "readonly") {
  return db.transaction(store, mode).objectStore(store);
}
function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function getAllScenes() {
  return (await requestResult(transaction("scenes").getAll())).sort((a, b) => a.createdAt - b.createdAt);
}
async function saveScene(scene) {
  await requestResult(transaction("scenes", "readwrite").put(scene));
  scenes = await getAllScenes();
}
async function saveSetting(key, value) {
  await requestResult(transaction("settings", "readwrite").put({ key, value }));
}
async function loadSetting(key) {
  const item = await requestResult(transaction("settings").get(key));
  return item?.value ?? null;
}
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  window.setTimeout(() => el.classList.remove("show"), 2600);
}
function safeTitle(value) {
  return String(value || "Ruangan tanpa nama").replace(/[<>]/g, "").slice(0, 80);
}
function revokeViewerUrls() {
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
  objectUrls = [];
}
function sceneConfig(scene) {
  const url = URL.createObjectURL(scene.image);
  objectUrls.push(url);
  return {
    type: "equirectangular",
    panorama: url,
    title: scene.title,
    autoLoad: true,
    showZoomCtrl: true,
    hotSpots: (scene.hotspots || []).map((spot) => ({
      pitch: spot.pitch, yaw: spot.yaw, type: "scene", sceneId: spot.targetId,
      text: spot.label || "Pindah ruangan", cssClass: "custom-hotspot"
    }))
  };
}
function renderSceneList() {
  const list = $("#scene-list");
  $("#scene-count").textContent = String(scenes.length);
  list.replaceChildren();
  if (!scenes.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Belum ada panorama. Tambahkan foto 360° untuk memulai.";
    list.append(empty);
  }
  for (const scene of scenes) {
    const button = document.createElement("button");
    button.className = "scene-item" + (scene.id === activeSceneId ? " active" : "");
    button.type = "button";
    button.addEventListener("click", () => selectScene(scene.id));
    const image = document.createElement("img");
    image.className = "scene-thumb";
    image.alt = "";
    image.src = URL.createObjectURL(scene.image);
    const name = document.createElement("span");
    name.className = "scene-name";
    name.textContent = scene.title;
    const remove = document.createElement("span");
    remove.className = "scene-delete";
    remove.textContent = "×";
    remove.title = "Hapus ruangan";
    remove.addEventListener("click", async (event) => {
      event.stopPropagation();
      if (!window.confirm("Hapus panorama " + scene.title + "?")) return;
      await requestResult(transaction("scenes", "readwrite").delete(scene.id));
      scenes = await getAllScenes();
      if (activeSceneId === scene.id) activeSceneId = scenes[0]?.id || null;
      for (const item of scenes) {
        item.hotspots = (item.hotspots || []).filter((spot) => spot.targetId !== scene.id);
        await saveScene(item);
      }
      await rebuildViewer();
      toast("Ruangan dihapus.");
    });
    button.append(image, name, remove);
    list.append(button);
  }
  const select = $("#destination-select");
  const selected = select.value;
  select.replaceChildren(new Option("Pilih ruangan tujuan", ""));
  scenes.filter((scene) => scene.id !== activeSceneId).forEach((scene) => select.add(new Option(scene.title, scene.id)));
  if (scenes.some((scene) => scene.id === selected)) select.value = selected;
  $("#hotspot-mode").disabled = scenes.length < 2 || !activeSceneId;
}
async function rebuildViewer() {
  revokeViewerUrls();
  if (viewer) { viewer.destroy(); viewer = null; }
  renderSceneList();
  const host = $("#panorama");
  if (!scenes.length) {
    host.innerHTML = '<div class="viewer-placeholder"><span>360°</span><p>Tambahkan foto panorama untuk membuka penampil interaktif.</p></div>';
    $("#active-title").textContent = "Pilih panorama";
    $("#viewer-message").textContent = "Menunggu foto 360°";
    return;
  }
  if (!scenes.some((scene) => scene.id === activeSceneId)) activeSceneId = scenes[0].id;
  host.replaceChildren();
  const configs = Object.fromEntries(scenes.map((scene) => [scene.id, sceneConfig(scene)]));
  viewer = window.pannellum.viewer("panorama", {
    default: { firstScene: activeSceneId, sceneFadeDuration: 450, autoLoad: true, showControls: true },
    scenes: configs
  });
  viewer.on("scenechange", (id) => {
    activeSceneId = id;
    const scene = scenes.find((item) => item.id === id);
    $("#active-title").textContent = scene?.title || "Panorama";
    $("#viewer-message").textContent = "Panorama aktif";
    renderSceneList();
    renderFloorPlan();
  });
  const active = scenes.find((scene) => scene.id === activeSceneId);
  $("#active-title").textContent = active?.title || "Panorama";
  $("#viewer-message").textContent = "Panorama siap";
  viewer.on("mousedown", (event) => {
    if (!hotspotMode || !viewer) return;
    const targetId = $("#destination-select").value;
    if (!targetId) { toast("Pilih ruangan tujuan terlebih dahulu."); return; }
    const [pitch, yaw] = viewer.mouseEventToCoords(event);
    const target = scenes.find((scene) => scene.id === targetId);
    if (!target) return;
    const spot = { pitch, yaw, targetId, label: target.title };
    const current = scenes.find((scene) => scene.id === activeSceneId);
    current.hotspots = [...(current.hotspots || []), spot];
    viewer.addHotSpot({ pitch, yaw, type: "scene", sceneId: targetId, text: target.title });
    awaitSaveHotspots(current);
    hotspotMode = false;
    $("#hotspot-mode").textContent = "＋ Tambah hotspot penghubung";
    toast("Hotspot ditambahkan.");
  });
}
async function awaitSaveHotspots(scene) {
  await saveScene(scene);
}
async function selectScene(id) {
  if (!scenes.some((scene) => scene.id === id)) return;
  activeSceneId = id;
  if (viewer) viewer.loadScene(id);
  else await rebuildViewer();
  renderSceneList();
}
async function handlePanoramaFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const id = crypto.randomUUID();
    const scene = {
      id, title: safeTitle(file.name.replace(/\.[^.]+$/, "")),
      image: file, hotspots: [], floorPin: null, createdAt: Date.now()
    };
    await saveScene(scene);
    if (!activeSceneId) activeSceneId = id;
  }
  await rebuildViewer();
  toast(files.length + " file diproses. Periksa tampilan panorama.");
}
async function renderFloorPlan() {
  const host = $("#floorplan");
  host.replaceChildren();
  if (!floorPlanUrl) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Unggah gambar denah untuk menempatkan penanda ruangan.";
    host.append(empty);
    $("#floorplan-help").textContent = "Belum ada denah";
    return;
  }
  const image = document.createElement("img");
  image.src = floorPlanUrl;
  image.alt = "Denah gedung";
  host.append(image);
  $("#floorplan-help").textContent = "Klik denah untuk menandai ruangan aktif";
  for (const scene of scenes.filter((item) => item.floorPin)) {
    const marker = document.createElement("button");
    marker.className = "floor-marker";
    marker.type = "button";
    marker.style.left = scene.floorPin.x + "%";
    marker.style.top = scene.floorPin.y + "%";
    marker.setAttribute("aria-label", scene.title);
    const label = document.createElement("span");
    label.textContent = scene.title;
    marker.append(label);
    marker.addEventListener("click", (event) => { event.stopPropagation(); selectScene(scene.id); });
    host.append(marker);
  }
  host.onclick = async (event) => {
    if (!activeSceneId) return;
    const rect = image.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    const scene = scenes.find((item) => item.id === activeSceneId);
    scene.floorPin = { x, y };
    await saveScene(scene);
    await renderFloorPlan();
    toast("Penanda denah disimpan untuk " + scene.title + ".");
  };
}
async function init() {
  try {
    db = await openDatabase();
    scenes = await getAllScenes();
    metadata = (await loadSetting("building-metadata")) || metadata;
    $("#building-name").value = metadata.buildingName || "";
    $("#latitude").value = metadata.latitude || "";
    $("#longitude").value = metadata.longitude || "";
    const floorBlob = await loadSetting("floor-plan");
    if (floorBlob) floorPlanUrl = URL.createObjectURL(floorBlob);
    $("#storage-status").textContent = "Penyimpanan lokal aktif";
    activeSceneId = scenes[0]?.id || null;
    await rebuildViewer();
    await renderFloorPlan();
  } catch (error) {
    console.error(error);
    $("#storage-status").textContent = "Penyimpanan tidak tersedia";
    toast("Gagal membuka penyimpanan lokal. Periksa dukungan IndexedDB browser.");
  }
  $("#panorama-files").addEventListener("change", async (event) => {
    await handlePanoramaFiles([...event.target.files]);
    event.target.value = "";
  });
  $("#hotspot-mode").addEventListener("click", () => {
    hotspotMode = !hotspotMode;
    $("#hotspot-mode").textContent = hotspotMode ? "Mode aktif — klik panorama" : "＋ Tambah hotspot penghubung";
    $("#viewer-message").textContent = hotspotMode ? "Klik posisi hotspot di panorama" : "Panorama siap";
  });
  $("#floorplan-file").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    await saveSetting("floor-plan", file);
    if (floorPlanUrl) URL.revokeObjectURL(floorPlanUrl);
    floorPlanUrl = URL.createObjectURL(file);
    await renderFloorPlan();
    event.target.value = "";
  });
  $("#save-location").addEventListener("click", async () => {
    const latitude = $("#latitude").value.trim();
    const longitude = $("#longitude").value.trim();
    if ((latitude && !Number.isFinite(Number(latitude))) || (longitude && !Number.isFinite(Number(longitude)))) {
      toast("Koordinat harus berupa angka."); return;
    }
    if ((latitude && (Number(latitude) < -90 || Number(latitude) > 90)) ||
        (longitude && (Number(longitude) < -180 || Number(longitude) > 180))) {
      toast("Latitude atau longitude di luar rentang yang valid."); return;
    }
    metadata = { buildingName: $("#building-name").value.trim(), latitude, longitude };
    await saveSetting("building-metadata", metadata);
    toast("Metadata gedung disimpan.");
  });
}
init();