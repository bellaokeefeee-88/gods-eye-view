import { catalogControlServices } from './catalog.js';
import { StyleManager } from '../ui/composition.js';
import { installZoomOutGuard } from './zoomOutGuard.js';
import { initCockpitCloudEffects } from '../cockpitCloudEffects.js';
import { t } from '../i18n/index.js';

/**
 * Construct the existing controls and camera presentation. `initialShareCode`
 * opens a share code (the `<code>` of `/share/<code>`) at start-up, for a host
 * whose address does not carry one. `localePicker: false` removes the language
 * picker, for a host that does not initialize Core's locale.
 */
export function createApplicationControls({
  scene: { viewer, mapStackController, operations, wilkumNavigator },
  loaderStatus,
  Controls = StyleManager,
  services,
  catalog,
  placeSearch,
  defer,
  initialShareCode = null,
  localePicker = true,
}) {
  // Initialize the style manager (post-processing, HUD, locations, share links)
  const styleManager = new Controls(viewer, {
    services: {
      ...services,
      ...operations.surface.controlServices,
      searchAndFlyTo: operations.searchAndFlyTo,
      fetchRegionalBrief: (...args) =>
        operations.requests.regional.getBrief(...args),
      ...catalogControlServices(catalog),
    },
    requestServices: operations.requests,
    mapStackController,
    placeSearch,
    // A share code to open at start-up instead of the page's address.
    initialShareCode,
    localePicker,
  });
  defer(() => styleManager.orbitController.stop());
  defer(() => styleManager.hud.destroy());
  defer(() => styleManager.dispose());

  // A URL can carry an older shared camera (the current shortcut points to
  // Austin). Let normal share restoration finish, then enforce the requested
  // Polresta Banda Aceh regional opening view without discarding shared layers
  // or visual settings.
  const focusWilkumAfterRestore = () => {
    if (!viewer.isDestroyed()) wilkumNavigator?.showWilkum?.();
  };
  void styleManager.initialRestorePromise.then(
    focusWilkumAfterRestore,
    focusWilkumAfterRestore,
  );
  defer(
    installZoomOutGuard(viewer, {
      subscribeCameraHandoff: (listener) =>
        styleManager.subscribeCameraHandoff?.(listener),
    }),
  );
  // The previous multi-canvas weather compositor remains disabled. Cockpit
  // clouds use a separate, capped low-resolution GPU pass that never attaches
  // Cesium fog or post-process stages and is fully stopped in map mode.
  const weatherEffects = null;
  const cockpitCloudEffects = initCockpitCloudEffects(viewer, {
    weatherService: operations.requests.weather,
  });
  defer(() => cockpitCloudEffects?.destroy());

  // The scene phase installs the Wilkum Polresta Banda Aceh navigator and
  // flies to its regional overview before controls are constructed. Do not
  // override that configured default with the upstream Austin demo location.
  if (!styleManager.hasShareState) {
    loaderStatus.textContent = t('Wilkum Polresta Banda Aceh ready');
  } else {
    loaderStatus.textContent = t('Restoring shared view...');
  }

  return { styleManager, weatherEffects, cockpitCloudEffects };
}
