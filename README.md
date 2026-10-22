# Mini Dashboard

A full-screen wall dashboard: the time in Amsterdam and the team's other time zones, the date and ISO week, the current
weather and whether precipitation is coming. It runs in Firefox on a Raspberry Pi screen.

![The dashboard](docs/screenshot.png)

## What it shows

**`/`**, the main page:

- Date and ISO week, in Europe/Amsterdam
- Amsterdam time, large, with seconds
- Kolkata, New York and UTC, each with its zone abbreviation and UTC offset
- The current weather: condition, temperature and wind, measured at Buienradar's Volkel station (Eindhoven when Volkel
  has no reading)
- Precipitation in Veghel in the next hour, from Buienradar's radar forecast: a rain icon with the time it starts
  ("13:15") or, while it's raining, the time it stops ("until 13:20"). Nothing is shown when it stays dry, or when it
  rains for the whole hour. Below 0.1 mm/h counts as dry.
- Weather and precipitation are refreshed every 5 minutes. If refreshing fails, the last reading stays and is dimmed
  once it is more than 30 minutes old.
- A gong at :55 every hour from 09:55 to 21:55, Amsterdam time

**`/clock`**: just the date and a full-screen Amsterdam clock.

The browser has to allow autoplay for the dashboard's address, or the gong stays silent.

## Configuration

`src/config.ts`: the home time zone, the other clocks, the weather stations, the precipitation location and the gong
times. Nothing else: no API keys or environment variables.

## Data source

Weather and precipitation data come from [Buienradar.nl](https://www.buienradar.nl), through the server routes
`/api/weather` (the [JSON feed](https://data.buienradar.nl/2.0/feed/json)) and `/api/precipitation`
(`https://gps.buienradar.nl/getrr.php`). Buienradar allows free use for non-commercial purposes on condition that the
source is credited, which the "Buienradar.nl" label on the weather bar does
([terms](https://www.buienradar.nl/overbuienradar/gratis-weerdata)).

## Development

Needs Node.js 24 (see `.nvmrc`).

```sh
npm ci
npm run dev    # http://localhost:3000
```

| Script                                    | What it does         |
| ----------------------------------------- | -------------------- |
| `npm run dev`                             | Development server   |
| `npm run build`                           | Production build     |
| `npm test` / `npm run test:watch`         | Vitest               |
| `npm run lint`                            | ESLint               |
| `npm run typecheck`                       | TypeScript 7 (`tsc`) |
| `npm run format` / `npm run format:check` | Prettier             |

CI runs lint, the format check, the typecheck, the tests and the build on every pull request.

TypeScript: `typescript` is an alias for `@typescript/typescript6`, because typescript-eslint doesn't support TypeScript
7 yet; `tsc` itself is TypeScript 7 (`@typescript/native`). See the
[TypeScript 7 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0).

## Docker

This is how to run a production build: the image uses Next.js' standalone output (`next start` doesn't support it) and
runs as a non-root user (uid 1000) on port 3000.

```sh
docker build -t mini-dashboard .
docker run -p 3000:3000 mini-dashboard
```

`GET /healthz/live` returns `200 ok` for liveness and readiness probes.

## Deployment

CI builds the image on every pull request and scans it with Trivy (it fails on critical vulnerabilities that have a
fix). Every push to `main` publishes that scanned image as `ghcr.io/fdaniel02/mini-dashboard`, tagged `latest` and
`sha-<commit>`.

It runs in the k3s homelab cluster at https://mini-dashboard.home.robospace.uk, deployed by Argo CD from
[cluster-gitops](https://github.com/fdaniel02/cluster-gitops). Renovate commits each new image digest there.
