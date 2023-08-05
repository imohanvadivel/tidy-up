import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { viteSingleFile } from "vite-plugin-singlefile";
import svgLoader from "vite-svg-loader";

let watch = null;
if (process.env.NODE_ENV === "DEV") watch = {};

export default defineConfig({
    plugins: [svelte({}), svgLoader({ defaultImport: "raw" }), viteSingleFile()],
    build: {
        watch,
        emptyOutDir: false,
        minify: !watch,
    },
    resolve: {
        alias: {
            $lib: "./src/lib",
            $assets: "./src/assets",
        },
    },
});
