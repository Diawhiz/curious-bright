import { defineComputeConfig } from "@prisma/compute-sdk/config";

export default defineComputeConfig({
  app: {
    name: "backend",
    framework: "custom",
    httpPort: 3000,
    build: {
      command: "pnpm dlx @vercel/ncc build src/index.ts -o dist",
      outputDirectory: "dist",
      entrypoint: "index.js",
    }
  }
});
