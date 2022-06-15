module.exports = {
  "*": "prettier --ignore-unknown --write",
  "*.{js,ts,tsx}": "yarn run eslint",
  "*.{ts,tsx}": () => "yarn run typecheck",
  "*.prisma": () => "yarn prisma format",
};
