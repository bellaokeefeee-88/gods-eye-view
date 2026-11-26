# CCTV: accessible-first operating guide

This guide separates feeds that can already be opened in GOD EYE VIEW from the
Banda Aceh municipal portal, whose native feed contract has not yet been
provided to this project.

## 1. Open CCTV inside the globe

The application already contains a CCTV layer, Cesium camera markers, a camera
selection panel, source health checks, and a playback path for supported feed
types. The server exposes:

- `GET /api/cctv/sources` — normalized camera catalog
- `GET /api/cctv/health` — source health summary
- `GET /api/cctv/stream/:id` — stream proxy for a configured source
- `GET /api/cctv/media/:id` — media proxy for a configured source
- `GET /api/cctv/frame/:id` — frame proxy for a configured source

Use the app's CCTV layer/control panel to show the catalog, select a camera
marker, and open its camera panel. A marker is not proof that a live stream is
available: check the source health and playback state. Image snapshots and
video streams are different feed types.

The catalog currently loads supported public open-data packs when their
providers are enabled. Which cameras appear depends on upstream availability,
network access, source caps, and provider terms. The current catalog is
multi-region; it must not be described as a Banda Aceh camera catalog.

## 2. Check the running instance

From the same host and port where GOD EYE VIEW is running, open:

```text
/api/cctv/sources
/api/cctv/health
```

Expected result: JSON responses. An empty source list means no camera sources
were loaded; it does not mean the CCTV player is broken. A source can be listed
but offline or unable to play. Confirm both catalog presence and health before
operational use.

For a local development instance, the base URL is normally
`http://localhost:4173`. For a deployed instance, use its configured HTTPS
origin instead.

## 3. Public Banda Aceh portal (available now, separate view)

The existing Wilkum navigator provides a direct link to the official public
portal:

- https://cctv.bandaacehkota.go.id/

This opens the public portal in a separate browser tab. It is currently the
verified access path for Banda Aceh public CCTV. The portal has **not** been
wired into the Cesium camera catalog or in-globe video player: no official
read-only API/feed schema and embedding/redistribution permission have been
provided to the project.

Do not infer a camera stream URL from the portal page, scrape undocumented
endpoints, or use private RTSP URLs, credentials, or internal network
addresses. Do not place guessed camera coordinates on the globe.

## 4. Bring an approved local feed into the globe

For feeds that the operator explicitly permits this application to consume,
place a JSON array in a file and set `CCTV_SOURCES_FILE` to that file path on
the GOD EYE VIEW server. Alternatively, configure `CCTV_SOURCES_JSON` with a
JSON array. Use the application's normalized camera source fields:

```json
[
  {
    "id": "operator-assigned-camera-id",
    "name": "Operator-approved camera name",
    "lat": 5.55,
    "lon": 95.32,
    "feedUrl": "https://approved.example.gov/camera/stream.m3u8",
    "feedType": "hls",
    "source": "Official operator name",
    "attribution": "Required attribution text"
  }
]
```

This is an illustrative shape, not a claim that the example URL exists. Confirm
the exact accepted fields against the deployed version's source normalizer
before loading a production catalog. Only use operator-approved public URLs.
Keep upstream hosts allowlisted and apply timeouts, rate limits, response-size
limits, and a documented refresh interval. Never put passwords or bearer
tokens in a client-visible catalog.

Supported feed types include `image`, `mjpeg`, `mp4`, `webm`, and `hls`.
The upstream URL must actually serve the declared media type. A browser
playback failure can also result from upstream CORS, codec, TLS, or network
restrictions.

## 5. Verification checklist

- [ ] `/api/cctv/sources` returns the expected camera records.
- [ ] Coordinates are verified by the source operator and fall in the correct
      geographic area.
- [ ] `/api/cctv/health` reports the source as reachable.
- [ ] The camera marker appears in the correct globe location.
- [ ] Selecting the marker opens the camera panel.
- [ ] The stream or frame plays and updates; no stale still is presented as
      live video.
- [ ] Attribution, permitted use, retention, and recording restrictions are
      displayed and followed.
- [ ] Offline/error states are visible and do not masquerade as live feeds.

## 6. Banda Aceh integration gate

When Diskominfotik supplies its official OpenAPI/documentation and written
permission, implement a dedicated provider pack with a strict host allowlist,
schema validation, camera ID and coordinate checks, status mapping, feed-type
mapping, attribution, and health monitoring. Group verified records by the
19 Polsek only after camera coordinates and jurisdiction assignments have
been checked. Until then, the official portal shortcut remains the honest,
working access route for Banda Aceh.
