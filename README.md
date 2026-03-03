# Central de Deudores del BCRA

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&labelColor=20232a)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2-22b5bf)
[![Live demo](https://img.shields.io/badge/Live_demo-GitHub_Pages-181717?logo=github)](https://pmolina.github.io/bcra/)

Look up the debt history of up to 10 Argentine CUITs using the [BCRA Central de Deudores](https://www.bcra.gob.ar/BCRAyVos/Sistemas_de_informacion_u_operativos.asp) public API.

## Features

- Enter up to 10 CUITs (with or without dashes)
- Check digit validation using the official AFIP algorithm
- Parallel requests to the BCRA public API
- Stacked bar chart per CUIT showing debt by entity and period
- Bars with irregular credit status (≥ 2) show a red line on their right edge
- The status badge reflects only the most recent reported period
- Rejected checks table per CUIT
- Warning badges for irregular debt situations
- Shareable URLs per CUIT — clicking the share button copies a `?cuit=` link to the clipboard; opening a shared URL pre-fills the input and runs the query automatically
- Dark mode by default, with light mode toggle and `localStorage` persistence

## Tech stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## API

Uses the BCRA public API:

```
GET https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/Historicas/{cuit}
GET https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/ChequesRechazados/{cuit}
```
