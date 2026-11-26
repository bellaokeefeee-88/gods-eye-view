import * as Cesium from 'cesium';

// Official SIMAS Kemenag coordinates for Masjid Raya Baiturrahman,
// Jl. Moh. Jam No. 1, Kampung Baru, Banda Aceh.
const WILKUM_VIEW = Object.freeze({
  longitude: 95.317265,
  latitude: 5.553592,
  height: 9500,
  heading: 0,
  pitch: -52,
});

const POLSEK_GROUPS = Object.freeze([
  {
    title: 'KOTA BANDA ACEH',
    stations: [
      'Polsek Baiturrahman',
      'Polsek Banda Raya',
      'Polsek Kuta Alam',
      'Polsek Kuta Raja',
      'Polsek Ulee Kareng',
      'Polsek Lueng Bata',
      'Polsek Syiah Kuala',
      'Polsek Meuraxa',
      'Polsek Jaya Baru',
    ],
  },
  {
    title: 'KABUPATEN ACEH BESAR',
    stations: [
      'Polsek Darul Imarah',
      'Polsek Ingin Jaya',
      'Polsek Darussalam',
      'Polsek Mesjid Raya',
      'Polsek Peukan Bada',
      'Polsek Darul Kamal',
      'Polsek Blang Bintang',
      'Polsek Kuta Baro',
      'Polsek Krueng Barona Jaya',
      'Polsek Baitussalam',
    ],
  },
]);

function addStyles() {
  if (document.getElementById('gev-wilkum-styles')) return;
  const style = document.createElement('style');
  style.id = 'gev-wilkum-styles';
  style.textContent = `
    #gev-wilkum-nav{position:fixed;z-index:30;top:92px;left:14px;width:min(290px,calc(100vw - 28px));color:#d9faff;font:12px/1.4 system-ui,sans-serif}
    #gev-wilkum-nav details{background:rgba(9,17,27,.88);border:1px solid rgba(66,220,238,.42);border-radius:12px;box-shadow:0 8px 28px #0008;backdrop-filter:blur(12px);overflow:hidden}
    #gev-wilkum-nav summary{cursor:pointer;list-style:none;padding:12px 14px;font-weight:800;letter-spacing:.14em;color:#65e8f5}
    #gev-wilkum-nav summary::-webkit-details-marker{display:none}
    #gev-wilkum-nav .gev-wilkum-body{max-height:min(62vh,560px);overflow:auto;padding:0 10px 12px}
    #gev-wilkum-nav .gev-wilkum-all{width:100%;margin:0 0 10px;padding:10px;border:1px solid #5bddea;border-radius:8px;background:#103747;color:#e8fdff;font-weight:800}
    #gev-wilkum-nav .gev-cctv-public{display:block;width:100%;box-sizing:border-box;margin:0 0 10px;padding:10px;border:1px solid #e4bd69;border-radius:8px;background:rgba(105,75,22,.32);color:#ffe9b1;text-align:center;text-decoration:none;font-weight:800;letter-spacing:.04em}
    #gev-wilkum-nav .gev-cctv-public:focus-visible{outline:2px solid #f2ce75;outline-offset:2px}
    #gev-wilkum-nav h3{margin:10px 4px 6px;color:#e4bd69;font-size:10px;letter-spacing:.13em}
    #gev-wilkum-nav .gev-polsek{display:block;width:100%;text-align:left;margin:4px 0;padding:8px 10px;border:1px solid #ffffff20;border-radius:7px;background:#ffffff0d;color:#eaf8fb}
    #gev-wilkum-nav button:focus-visible,#gev-wilkum-nav summary:focus-visible{outline:2px solid #f2ce75;outline-offset:2px}
    #gev-wilkum-nav button:disabled{opacity:.55}
    #gev-wilkum-nav .gev-wilkum-status{padding:6px 4px;color:#9fdde4;font-size:11px}
    @media(max-width:600px){#gev-wilkum-nav{top:76px;width:min(260px,calc(100vw - 24px));left:12px}#gev-wilkum-nav .gev-wilkum-body{max-height:52vh}}
  `;
  document.head.appendChild(style);
}

/**
 * Set a Banda Aceh/Aceh Besar overview on every page load and add a Polsek navigator.
 */
export function installWilkumNavigator(viewer, operations) {
  if (!viewer || viewer.isDestroyed()) return { destroy() {} };
  addStyles();
  const nav = document.createElement('aside');
  nav.id = 'gev-wilkum-nav';
  nav.setAttribute('aria-label', 'Navigasi Wilkum Polresta Banda Aceh');
  const details = document.createElement('details');
  details.open = true;
  const summary = document.createElement('summary');
  summary.textContent = 'WILKUM POLRESTA • 19 POLSEK';
  details.appendChild(summary);
  const body = document.createElement('div');
  body.className = 'gev-wilkum-body';
  const all = document.createElement('button');
  all.type = 'button';
  all.className = 'gev-wilkum-all';
  all.textContent = 'TAMPILKAN SELURUH WILKUM';
  body.appendChild(all);
  const status = document.createElement('div');
  status.className = 'gev-wilkum-status';
  status.setAttribute('role', 'status');
  status.textContent = 'Titik awal: Masjid Raya Baiturrahman, Banda Aceh';
  body.appendChild(status);
  const publicCctv = document.createElement('a');
  publicCctv.className = 'gev-cctv-public';
  publicCctv.href = 'https://cctv.bandaacehkota.go.id/';
  publicCctv.target = '_blank';
  publicCctv.rel = 'noopener noreferrer';
  publicCctv.textContent = 'BUKA CCTV PUBLIK KOTA BANDA ACEH ↗';
  publicCctv.setAttribute('aria-label', 'Buka portal resmi CCTV publik Kota Banda Aceh di tab baru');
  body.appendChild(publicCctv);
  let active = true;
  let pending = false;

  function setBusy(value, message) {
    pending = value;
    all.disabled = value;
    body.querySelectorAll('.gev-polsek').forEach((button) => {
      button.disabled = value;
    });
    status.textContent = message;
  }

  function showWilkum() {
    if (!active || viewer.isDestroyed()) return;
    viewer.camera.cancelFlight();
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        WILKUM_VIEW.longitude,
        WILKUM_VIEW.latitude,
        WILKUM_VIEW.height,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(WILKUM_VIEW.heading),
        pitch: Cesium.Math.toRadians(WILKUM_VIEW.pitch),
        roll: 0,
      },
      duration: 2.5,
    });
    status.textContent = 'Titik pandang: Masjid Raya Baiturrahman • Wilkum 19 Polsek';
  }

  all.addEventListener('click', showWilkum);
  for (const group of POLSEK_GROUPS) {
    const heading = document.createElement('h3');
    heading.textContent = group.title;
    body.appendChild(heading);
    for (const name of group.stations) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'gev-polsek';
      button.textContent = name;
      button.addEventListener('click', async () => {
        if (pending || !active) return;
        setBusy(true, 'Mencari lokasi ' + name + '…');
        try {
          const result = await operations.searchAndFlyTo(
            viewer,
            name + ', Aceh, Indonesia',
            { viewMode: 'overview', duration: 2.5 },
          );
          if (result?.cancelled) return;
          status.textContent = result
            ? 'Fokus peta: ' + (result.label || name)
            : 'Lokasi belum ditemukan. Coba lagi atau periksa ejaan nama.';
        } catch (error) {
          console.warn('[Wilkum] Could not navigate to ' + name, error);
          status.textContent = 'Lokasi belum dapat dimuat. Periksa koneksi lalu coba lagi.';
        } finally {
          if (active) setBusy(false, status.textContent);
        }
      });
      body.appendChild(button);
    }
  }
  details.appendChild(body);
  nav.appendChild(details);
  document.body.appendChild(nav);

  // The regional overview is the default on every fresh app load.
  showWilkum();

  return {
    showWilkum,
    destroy() {
      active = false;
      nav.remove();
    },
  };
}
