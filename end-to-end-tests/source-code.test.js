import fs from 'fs';
import glob from 'glob';
import prettier from 'prettier';
import packageJson from '../package.json';

// It is useful to remove .travis.yml for work-in-progress
// branches, but make sure we don't forget to restore it
it('.travis.yml is present', async () => {
  return fs.readFileSync('.travis.yml');
});

it('is formated with prettier', () => {
  const files = glob.sync(
    '{backend,config,end-to-end-tests,scripts,src}/**/*.js'
  );
  expect(files.length).toBeGreaterThan(48); // Sanity check

  const notProperlyFormated = [];
  files.forEach(file => {
    if (!prettier.check(fs.readFileSync(file, 'utf-8'), packageJson.prettier)) {
      notProperlyFormated.push(file);
    }
  });
  expect(notProperlyFormated).toEqual([]);
});
