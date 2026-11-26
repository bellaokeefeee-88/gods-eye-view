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

## Third-party public live directory candidates (checked 26 November 2026)

The independent Pantau CCTV Nusantara directory exposes public watch pages for the following Banda Aceh cameras. Its pages label them Live and provide coordinates. These are third-party directory observations, not a direct official uptime check and not a grant of permission to proxy or re-embed the underlying stream.

| Camera | Administrative location | Latitude | Longitude | Public watch page |
| --- | --- | ---: | ---: | --- |
| Bustanussalatin 7 | Kampung Baru, Baiturrahman | 5.5499 | 95.3174 | https://cctvnusantara.com/cctv/banda-aceh-bdh-12 |
| Ulee Lheue 1.1 | Gampong Pie, Meuraxa | 5.5546 | 95.2886 | https://cctvnusantara.com/cctv/banda-aceh-bdh-23 |
| Kartini 190 View | Peunayong, Kuta Alam | 5.5598 | 95.3195 | https://cctvnusantara.com/cctv/banda-aceh-bdh-52 |
| Lhong Raya 1 | Lhong Raya, Banda Raya | 5.5256 | 95.3265 | https://cctvnusantara.com/cctv/banda-aceh-bdh-55 |
| Underpass Beurawe | Beurawe, Kuta Alam | 5.5592 | 95.3315 | https://cctvnusantara.com/cctv/banda-aceh-bdh-71 |
| Pantau Ketinggian Air - KM 0 | Gampong Jawa, Kuta Raja | 5.5836 | 95.3136 | https://cctvnusantara.com/cctv/banda-aceh-bdh-75 |

### Safe initial integration mode

For the first GOD EYE VIEW iteration, use these records as **external-link camera markers** only: show the name, district, coordinates, observed status timestamp, and open the public watch page in a new browser tab. Do not send the third-party page URL to the native media player as if it were an HLS/MJPEG/MP4 stream. Do not proxy, extract, or re-publish media URLs without confirming the publisher's terms and the originating camera operator's permission. Re-check availability before displaying a green/live badge.
