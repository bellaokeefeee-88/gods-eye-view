# Run GOD EYE VIEW in a tablet browser with GitHub Codespaces

This setup lets the repository run in a cloud development container and be
opened from an Android tablet browser. It does not require a VPS or a local
Node.js installation on the tablet.

## Start

1. Open this repository on GitHub and choose **Code → Codespaces → Create codespace on main**.
2. Wait for the Codespace to finish creating and for `npm ci` to complete.
3. Open the **Ports** panel. Port `4173` is forwarded privately.
4. Open the forwarded address for port `4173` in the tablet browser. Sign in to
   GitHub in that browser if prompted.
5. To stop cloud usage, open the Codespaces menu and stop the Codespace. It can
   be resumed later.

The devcontainer starts the Vite app and allows only the matching
`<codespace-name>-4173.app.github.dev` host. The forwarded port is private.

## Limitations and security

- GitHub Codespaces usage is subject to the account's included quota and billing
  settings. Check the quota before prolonged use; ChatGPT Go does not include
  GitHub compute.
- The app starts without API keys and can use its keyless map/data sources.
  Optional provider credentials are not configured by this setup.
- Do not make port 4173 public. The app is designed primarily for local use,
  not as a hardened public production service. Do not enter private provider
  keys into a remotely accessible instance.
- This Codespaces setup is for browser access/testing, not a permanent
  always-on production deployment. Codespaces may stop when idle.
