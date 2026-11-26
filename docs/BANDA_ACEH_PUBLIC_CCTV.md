# Banda Aceh Public CCTV Integration

## Scope

The GOD EYE VIEW Wilkum navigator includes a direct shortcut to the official public CCTV portal:

- Portal: https://cctv.bandaacehkota.go.id/
- Operator/publisher: Pemerintah Kota Banda Aceh / Diskominfotik portal
- Access mode in this phase: user-initiated navigation to the public portal in a new tab
- Data boundary: only publicly published camera listings and feeds; no private camera endpoints, credentials, admin access, or authentication bypass.

## Public portal snapshot

At the time this integration was prepared, the public portal search index displayed 60 registered cameras: 38 online and 22 offline. These are a time-specific portal snapshot, not a live count stored in GOD EYE VIEW. Always use the portal's current status for operational decisions.

## Current implementation status

- Added a clearly labeled "BUKA CCTV PUBLIK KOTA BANDA ACEH" link to the Wilkum Polresta navigator.
- The link opens the official portal in a separate browser tab.
- The app does not yet ingest the portal's camera catalog, coordinates, status, or video frames into the Cesium globe.
- In-app camera mapping requires a documented public API or a redistribution/embedding permission and a verified schema for camera IDs, coordinates, status, feed URLs, and attribution.

## Next integration gate

Before building a native camera pack, verify with the portal operator:
1. Whether a public read-only catalog/API exists.
2. Whether camera coordinates and online/offline status may be consumed by third-party applications.
3. Whether public feed URLs may be embedded or proxied, and the permitted refresh/rate limits.
4. Required attribution and any restrictions on storage, recording, or redistribution.

Do not scrape private endpoints, defeat access controls, or represent an offline camera placeholder as a live feed.

## Public catalog observation (26 November 2026)

A public page-index snapshot of the official portal lists 60 entries: 38 marked online and 22 marked offline / under repair. This is a dated observation, not a live availability guarantee. The portal remains the authoritative place to check current camera state.

Visible online camera groups include:
- Kecamatan Baiturrahman: Bustanussalatin / B Salatin, Diponegoro, and water-level monitoring at Kampung Baru and Putroe Phang.
- Kecamatan Kuta Alam: Kartini and Underpass Beurawe.
- Kecamatan Banda Raya: Lhong Raya.
- Kecamatan Jaya Baru: water-level monitoring at Geuceu Meunara.
- Kecamatan Kuta Raja: water-level monitoring at KM 0.
- Kecamatan Meuraxa: port-area cameras and Ulee Lheue.

## Integration readiness

The public page output supports camera display names, kecamatan labels, and online/offline labels. It does not, by itself, establish a supported third-party API contract, WGS84 coordinates, stable public camera IDs, embeddable stream URLs, or permission to proxy/re-publish video. Those fields must not be guessed from camera names or inferred from unrelated map imagery.

The existing CCTV provider can ingest a documented JSON source through CCTV_SOURCES_FILE or CCTV_SOURCES_JSON, but a production Banda Aceh pack must only be populated after the operator supplies or confirms the approved schema and permitted playback URLs. Until then, keep the official portal shortcut available and label native Banda Aceh camera coverage as pending.
