module.exports = {
  REG_HAS_DEFINE: /(?:^|\s+)define\s*\(/mg,
  REG_HAS_USE: /(?:^|\s+)cola\.use\s*\(/mg,
  REG_REPLACE_USE: /(?:^|\s+)cola\.use\s*\(.*?\bfunction\b/mg
};
