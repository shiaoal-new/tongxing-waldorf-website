module.exports = {
  presets: ["next/babel"],
  plugins: [
    "babel-plugin-macros",
    process.env.NODE_ENV === "development" && require.resolve("./scripts/babel-plugin-source-locator.js"),
  ].filter(Boolean),
};
