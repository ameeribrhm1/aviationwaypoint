# Aviation Procedures app

A mobile-first React + Vite reference app for the departure, arrival and waypoint charts supplied in `Files.zip`.

## Run locally
1. Install Node.js (LTS).
2. In this folder run `npm install`.
3. Run `npm run dev` and open the local URL on your phone or computer.
4. Run `npm run build` to create the deployable `dist/` folder.

## Publish on GitHub Pages
Push this repository to GitHub on the `main` branch. In repository Settings → Pages, set the source to **GitHub Actions**. The included `.github/workflows/deploy.yml` builds and deploys the app automatically on each push.

## App features
- Departures and arrivals grouped by runway.
- Selecting a procedure opens its matching supplied chart.
- Chart viewer supports pinch zoom, drag/pan, and zoom buttons.
- Procedure summary and ordered waypoint details below the chart.
- Search across waypoint identifiers extracted from the six supplied waypoint-location images.
- Mobile-friendly bottom navigation and installable web-app manifest.

## Source-data note
The chart images are copied unchanged from the supplied ZIP. The bundled search dataset contains 211 identifier records transcribed from the six waypoint-location images using OCR (including normalized spellings where OCR confused letters and zeroes). Please cross-check operational coordinates, waypoint spelling, and procedure sequencing against the authoritative current aeronautical publications before operational use. This app is a reference viewer, not an approved navigation source. A few chart/index labels are not perfectly legible in the source scan; those are flagged in the UI where data is missing.
