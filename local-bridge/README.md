# Local Training Bridge

The Local Training Bridge is a separate local process for exposing workstation
information to the Piscina42 web application. It is intentionally independent
from the public application server in `server.ts`.

The bridge listens only on `127.0.0.1` so its data is available to the local
machine without exposing a new network service. Its port defaults to `4242` in
`config.ts`.

## Current endpoints

- `GET /health` returns bridge status, version, and generation time.
- `GET /workstation` returns a `WorkstationProbeResult` based exclusively on
  `mockWorkstationSnapshot`.

The bridge currently uses mocks. It does not inspect the host machine or run
system commands.

The browser client calls the bridge directly from the local Vite development
origin. CORS is restricted to `http://localhost:3000` and
`http://127.0.0.1:3000`; wildcard origins are not enabled.

## Explicitly prohibited endpoints

The bridge must not expose generic execution endpoints such as `/exec`,
`/run`, `/command`, or `/shell`. It must not execute arbitrary commands,
write files, or add integrations for WSL, Docker, Moulinette, or Ollama as
part of this skeleton.

## Commands

```sh
npm run bridge:dev
npm run bridge:start
```