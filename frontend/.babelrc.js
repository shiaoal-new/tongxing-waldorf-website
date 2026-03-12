module.exports = {
  presets: ["next/babel"],
  plugins: [
    "babel-plugin-macros",
    (process.env.NODE_ENV === "development" || ["preview", "dev", "local"].includes(process.env.NEXT_PUBLIC_APP_ENV)) && require.resolve("./scripts/babel-plugin-source-locator.js"),
  ].filter(Boolean),
};
