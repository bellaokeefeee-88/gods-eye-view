import * as Cesium from 'cesium';

const DATABASE_NAME = 'gev-virtual-tour';
const DATABASE_VERSION = 1;
const SETTINGS_STORE = 'settings';
const ENTITY_ID = 'gev-virtual-tour-location';
const TOUR_URL = '/virtual-tour/';

function readBuildingMetadata() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('scenes')) db.createObjectStore('scenes', { keyPath: 'id' });
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.close();
        resolve(null);
        return;
      }
      const tx = db.transaction(SETTINGS_STORE, 'readonly');
      const get = tx.objectStore(SETTINGS_STORE).get('building-metadata');
      get.onsuccess = () => {
        const metadata = get.result?.value ?? null;
        db.close();
        resolve(metadata);
      };
      get.onerror = () => {
        const error = get.error;
        db.close();
        reject(error);
      };
    };
  });
}

function validCoordinates(metadata) {
  if (!metadata) return false;
  const latitude = Number(metadata.latitude);
  const longitude = Number(metadata.longitude);
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
    Number.isFinite(longitude) && longitude >= -180 && longitude <= 180 &&
    metadata.latitude !== '' && metadata.longitude !== '';
}

/**
 * Add the locally configured Virtual Tour building to the existing Cesium globe.
 * The panorama database is shared by the root app and /virtual-tour/ on the same
 * origin. No image or building metadata is uploaded to GitHub or a remote API.
 */
export function installVirtualTourGlobe(viewer, { onOpen = null } = {}) {
  let disposed = false;
  let dataSource = null;
  let selectedListener = null;
  let entity = null;

  const ready = (async () => {
    if (!globalThis.indexedDB || !viewer || viewer.isDestroyed()) return false;
    let metadata;
    try {
      metadata = await readBuildingMetadata();
    } catch (error) {
      console.warn('[VirtualTour] Could not read local building metadata:', error);
      return false;
    }
    if (disposed || !validCoordinates(metadata) || viewer.isDestroyed()) return false;

    const latitude = Number(metadata.latitude);
    const longitude = Number(metadata.longitude);
    const name = String(metadata.buildingName || 'Virtual Tour 360').slice(0, 100);
    dataSource = new Cesium.CustomDataSource('virtual-tour-locations');
    entity = dataSource.entities.add({
      id: ENTITY_ID,
      name,
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 0),
      point: {
        pixelSize: 15,
        color: Cesium.Color.fromCssColorString('#e0bd62'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: name + '\nVIRTUAL TOUR 360°',
        font: '12px sans-serif',
        fillColor: Cesium.Color.fromCssColorString('#f2d98c'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -22),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      properties: {
        gevVirtualTour: true,
        virtualTourUrl: TOUR_URL,
      },
    });
    await viewer.dataSources.add(dataSource);
    if (disposed || viewer.isDestroyed()) {
      if (!viewer.isDestroyed()) viewer.dataSources.remove(dataSource, true);
      return false;
    }

    selectedListener = (selected) => {
      if (selected?.id !== ENTITY_ID) return;
      const url = selected.properties?.virtualTourUrl?.getValue?.() || TOUR_URL;
      if (typeof onOpen === 'function') onOpen(url, metadata);
      else window.open(url, '_blank', 'noopener,noreferrer');
      viewer.selectedEntity = undefined;
    };
    viewer.selectedEntityChanged.addEventListener(selectedListener);
    viewer.scene.requestRender();
    console.info('[VirtualTour] Building marker added to Cesium globe:', name);
    return true;
  })();

  return {
    ready,
    destroy() {
      disposed = true;
      if (selectedListener && !viewer.isDestroyed())
        viewer.selectedEntityChanged.removeEventListener(selectedListener);
      selectedListener = null;
      if (dataSource && !viewer.isDestroyed())
        viewer.dataSources.remove(dataSource, true);
      dataSource = null;
      entity = null;
    },
  };
}
