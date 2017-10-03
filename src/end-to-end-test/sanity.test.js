const fs = require("fs");

it(".travis.yml is present", async () => {
  return fs.readFileSync(".travis.yml");
});
