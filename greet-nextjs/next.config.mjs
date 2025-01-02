/** @type {import('next').NextConfig} */

import fs from "fs/promises";
import path from "path";

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {

    // Add a custom loader for .node files
    config.module.rules.push({
      test: /\.node$/,
      use: {
        loader: "node-loader",
      },
    });

    // Mark .node files as external in server builds
    if (isServer) {
      config.externals.push((context, request, callback) => {
        if (request.endsWith(".node")) {
          return callback(null, `commonjs ${request}`);
        }
        callback();
      });
    }
    return config;
  },
  async exportPathMap(defaultPathMap) {

    // Define source and destination directories
    const sourceDir = await path.resolve("src/pages/api");
    const destinationDir = await path.resolve(".next/server/pages/api");

    try {
      // Ensure destination directory exists
      await fs.mkdir(destinationDir, { recursive: true });

      // Read all files from the source directory
      const files = await fs.readdir(sourceDir);

      // Filter and copy files with custom extensions
      const extensionsToCopy = [ ".node"]; // Add extensions here
      for (const file of files) {
        const fileExt = path.extname(file);

        if (extensionsToCopy.includes(fileExt)) {
          const sourceFile = path.join(sourceDir, file);
          const destinationFile = path.join(destinationDir, file);
          await fs.copyFile(sourceFile, destinationFile);
          console.log(`Copied: ${sourceFile} -> ${destinationFile}`);
        }
      }
    } catch (err) {
      console.error("Error copying files:", err);
    }

    return defaultPathMap;
  },
};

export default nextConfig;
