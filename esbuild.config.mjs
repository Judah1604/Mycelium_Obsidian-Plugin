import esbuild from "esbuild";
import fs from "fs";

const prod = process.argv.includes("--prod");

const touchPlugin = {
  name: "touch-hotreload",
  setup(build) {
    build.onEnd(() => {
      fs.utimesSync(".hotreload", new Date(), new Date());
      console.log("Touched .hotreload");
    });
  },
};

if (prod) {
  esbuild
    .build({
      entryPoints: ["src/main.js"],
      bundle: true,
      outfile: "main.js",
      platform: "node",
      format: "cjs",
      target: "es2020",
      sourcemap: false,
      minify: true,
      external: ["obsidian"],
    })
    .catch(() => process.exit(1));
} else {
  const ctx = await esbuild.context({
    entryPoints: ["src/main.js"],
    bundle: true,
    outfile: "main.js",
    platform: "node",
    format: "cjs",
    target: "es2020",
    sourcemap: true,
    external: ["obsidian"],
    plugins: [touchPlugin],
  });

  await ctx.watch();

  console.log("Watching... rebuild on file change");
}
