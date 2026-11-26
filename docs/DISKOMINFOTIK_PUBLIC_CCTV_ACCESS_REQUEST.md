# Diskominfotik Banda Aceh — Public CCTV Integration Request

## Purpose

Prepare a documented, least-privilege request so GOD EYE VIEW can display only CCTV feeds and metadata that the City of Banda Aceh explicitly makes available for public viewing and permits third-party embedding or reuse.

Official public portal: https://cctv.bandaacehkota.go.id/

The public portal currently exposes camera names, administrative-area labels (kecamatan), and an online/offline indication in its public page output. This document does not assume that the portal provides a supported API, downloadable camera coordinates, or permission to republish the video feeds.

## Information to request from Diskominfotik

Ask for written confirmation and, where available, a public read-only integration specification covering:

1. **Public camera inventory**
   - Stable public camera ID
   - Public display name
   - Kecamatan and gampong / street / landmark
   - WGS84 latitude and longitude, if approved for public display
   - Camera category (traffic, public facility, flood/water level, port, etc.)
2. **Public status**
   - Online/offline/maintenance states
   - Timestamp and timezone of the last status update
   - Recommended polling interval and rate limits
3. **Public viewing**
   - Official embed URL or documented public playback endpoint
   - Supported media format (HLS, WebRTC, MJPEG, or browser page)
   - Whether third-party embedding is permitted
   - Whether a same-origin embed or official player must be used
4. **Usage conditions**
   - Required attribution and logo/credit wording
   - Restrictions on recording, screenshots, caching, redistribution, or public display
   - Any privacy masking or sensitive-camera exclusions
   - Data retention and incident-response contact
5. **Technical access**
   - Public API documentation or sample response
   - CORS / domain allowlist requirements
   - Availability/SLA and maintenance notice channel
   - A test endpoint or small approved camera subset

## Recommended permission wording

Request authorization for a **read-only public-information integration** in GOD EYE VIEW. The integration should:
- use only the approved public camera inventory and approved public playback links;
- show camera name, approved location, source attribution, and status timestamp;
- link out to the official portal when embedding is not explicitly allowed;
- avoid recording or storing video unless separately authorized;
- never use administrator credentials, private RTSP endpoints, internal network addresses, or access-control workarounds.

## Current implementation boundary

The Wilkum navigator already links to the official public portal. Native camera markers and in-app video playback are not yet enabled because the portal's supported public API, coordinates, playback terms, and redistribution/embedding permission have not been verified.

Until written confirmation and a documented feed schema are available, keep the portal shortcut as the only official Diskominfotik integration. Do not scrape undocumented endpoints or treat third-party camera directories as an official source.

## Acceptance checklist

- [ ] Written confirmation of permitted third-party use received
- [ ] Public API or documented inventory feed received
- [ ] Coordinate precision and permitted display scope confirmed
- [ ] Playback/embedding permission confirmed per camera category
- [ ] Attribution, rate limit, caching, and recording rules documented
- [ ] Test camera validated without credentials or private network access
- [ ] Provider health, status timestamp, and offline fallback tested
- [ ] Diskominfotik source attribution visible in GOD EYE VIEW
