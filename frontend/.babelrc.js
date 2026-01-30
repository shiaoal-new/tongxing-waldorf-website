module.exports = {
  presets: ["next/babel"],
  plugins: [
    "babel-plugin-macros",
    process.env.NODE_ENV === "development" && require.resolve("@locator/babel-jsx"),
  ].filter(Boolean),
};
