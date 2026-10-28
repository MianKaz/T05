# T05

## Multi-chart webpage

The chart page is a static website; it does not need a custom server or build step.

### Deploy to Vercel

1. Import this repository into Vercel.
2. Set **Root Directory** to `chart`.
3. Choose **Other** as the framework preset and leave the build command empty.
4. Deploy. Vercel will serve `index.html`, the CSS and JavaScript files, and the CSV files in `data/` as static assets.

The charts load D3.js from a CDN, so the deployed page needs an internet connection. For local preview, opening the HTML file directly may prevent the browser from loading CSV files; use a local preview option such as VS Code Live Server if needed.