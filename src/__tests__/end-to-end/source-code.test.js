import fs from "fs";
import glob from "glob";
import prettier from "prettier";

// It is useful to remove .travis.yml for work-in-progress
// branches, but make sure we don't forget to restore it
it(".travis.yml is present", async () => {
  return fs.readFileSync(".travis.yml");
});

it("is formated with prettier", () => {
  const files = glob.sync("{backend,src}/**/*.js");
  expect(files.length).toBeGreaterThan(45); // Sanity check

  const notProperlyFormated = [];
  files.forEach((file) => {
    if (!prettier.check(fs.readFileSync(file, "utf-8"), { parser: "babel" })) {
      notProperlyFormated.push(file);
    }
  });
  expect(notProperlyFormated).toEqual([]);
});
