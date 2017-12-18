import fs from 'fs';
import glob from 'glob';
import prettier from 'prettier';
import packageJson from '../package.json';

// It is useful to remove .travis.yml for work-in-progress
// branches, but make sure we don't forget to restore it
it('.travis.yml is present', async () => {
  return fs.readFileSync('.travis.yml');
});

// When we want to rebase the code coverage branch by doing
// a fresh `npm run eject`, having a scripts/ dir will trigger
// an error, so we have to live without it
it('scripts/ is not present', async () => {
  let success;
  try {
    fs.statSync('scripts').isDirectory();
    success = false;
  } catch (e) {
    success = true;
  }
  expect(success).toBeTruthy();
});

it('is formated with prettier', () => {
  const files = glob.sync('{backend,end-to-end-tests,src}/**/*.js');
  expect(files.length).toBeGreaterThan(39); // Sanity check

  const notProperlyFormated = [];
  files.forEach(file => {
    if (!prettier.check(fs.readFileSync(file, 'utf-8'), packageJson.prettier)) {
      notProperlyFormated.push(file);
    }
  });
  expect(notProperlyFormated).toEqual([]);
});
