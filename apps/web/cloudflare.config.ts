import { bindings, defineConfig, defineWorker } from "cf/config";
import { createWorkersResponseStoreServiceBindingConfig } from "@vinext/cloudflare/cache/config";

const responseStore = await createWorkersResponseStoreServiceBindingConfig({
  worker: {
    name: "gateworld-web-response-store",
    compatibilityDate: "2026-10-31",
    compatibilityFlags: ["nodejs_compat"],
  },
  bucket: "gateworld-web-response-store-cache-bodies",
});

export const responseStoreServiceBinding = responseStore.serviceBindingWorker;

export default defineConfig({
  worker: defineWorker({
    ...responseStore.applicationWorker,
    name: "gateworld-web",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-31",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ...responseStore.applicationWorker.env,
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      DB: bindings.d1({ name: "gateworld", id: "7b0a7e75-0098-49ea-9a96-abdb3fe02b2d" }),
      LIBRARY_IMG: bindings.r2({ name: "gateworld-images" }),
      ADMIN_TOKEN: bindings.secret(),
    },
  }),
});
