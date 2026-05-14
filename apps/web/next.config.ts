import type { NextConfig } from "next";
import path from "node:path";

/**
 * /website is now served by the Night flavor of the trail/newcontent preview.
 * Every live editorial route (kept on disk for history) redirects to its
 * Night equivalent. Reverting is a matter of removing this redirects() block.
 */
const NIGHT_BASE = "/website/trail/newcontent/night";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd(), "../.."),

  async redirects() {
    return [
      // Home
      { source: "/website", destination: NIGHT_BASE, permanent: false },

      // Product
      { source: "/website/products", destination: `${NIGHT_BASE}/products`, permanent: false },

      // Solutions + role pages
      { source: "/website/solutions",              destination: `${NIGHT_BASE}/solutions`,               permanent: false },
      { source: "/website/solutions/owners",       destination: `${NIGHT_BASE}/solutions/owners`,        permanent: false },
      { source: "/website/solutions/regional",     destination: `${NIGHT_BASE}/solutions/regional`,      permanent: false },
      { source: "/website/solutions/gms",          destination: `${NIGHT_BASE}/solutions/gms`,           permanent: false },
      { source: "/website/solutions/maintenance",  destination: `${NIGHT_BASE}/solutions/maintenance`,   permanent: false },
      { source: "/website/solutions/housekeeping", destination: `${NIGHT_BASE}/solutions/housekeeping`,  permanent: false },
      { source: "/website/solutions/front-desk",   destination: `${NIGHT_BASE}/solutions/front-desk`,    permanent: false },

      // Company
      { source: "/website/company",         destination: `${NIGHT_BASE}/company`,        permanent: false },
      { source: "/website/company/about",   destination: `${NIGHT_BASE}/company/about`,  permanent: false },
      // Routes the night flavor doesn't have yet — fall back to overview
      { source: "/website/company/careers", destination: `${NIGHT_BASE}/company`,        permanent: false },
      { source: "/website/company/story",   destination: `${NIGHT_BASE}/company`,        permanent: false },

      // Contact
      { source: "/website/contact", destination: `${NIGHT_BASE}/contact`, permanent: false },

      // Why StayOps
      { source: "/website/why", destination: `${NIGHT_BASE}/why`, permanent: false },
    ];
  },
};

export default nextConfig;
