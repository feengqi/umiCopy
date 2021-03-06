import { rimraf, winPath } from '@umijs/utils';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { figureOutExport } from './utils';

// const fixtures = join(__dirname, 'fixtures', 'utils');
// const absFixtures = join(fixtures, 'absolute');
//
// function format(str: string) {
//   return str.replace(new RegExp(__dirname, 'g'), '$CWD$');
// }

// test('abs esm export default', async () => {
//   expect(
//     format(await figureOutExport('', join(absFixtures, 'export-default.js'))),
//   ).toEqual(``);
// });
//
// test('abs esm export some', async () => {
//   expect(
//     format(await figureOutExport('', join(absFixtures, 'export-default.js'))),
//   ).toEqual(``);
// });
//
// test('abs esm export * from', async () => {
//   expect(
//     format(await figureOutExport('', join(absFixtures, 'export-*.js'))),
//   ).toEqual(``);
// });

xtest('figure out export', async () => {
  const testPath = winPath(join(__dirname, '.umi-test'));
  const testNodeModules = winPath(join(testPath, 'node_modules'));
  rimraf.sync(testPath);
  mkdirSync(testPath);
  mkdirSync(testNodeModules);

  // test package name import
  mkdirSync(winPath(join(testNodeModules, 'foo')));
  writeFileSync(
    winPath(join(testNodeModules, 'foo', 'package.json')),
    JSON.stringify({
      module: 'index.js',
    }),
  );
  writeFileSync(
    winPath(join(testNodeModules, 'foo', 'index.js')),
    `
    export default 'A';
  `,
  );
  expect(await figureOutExport(testPath, 'foo')).toEqual(
    `import _ from "foo";\nexport default _;\nexport * from "foo";`,
  );
  writeFileSync(
    winPath(join(testNodeModules, 'foo', 'index.js')),
    `
    exports = {a:'A'};
  `,
  );
  expect(await figureOutExport(testPath, 'foo')).toEqual(
    `import _ from "foo";\nexport default _;\nexport * from "foo";`,
  );
  // abs path import
  let asbPath = winPath(resolve(testNodeModules, 'bar'));
  mkdirSync(asbPath);
  writeFileSync(
    winPath(join(asbPath, 'bar.js')),
    'export default function func(){return;};',
  );
  expect(
    await figureOutExport(
      testPath,
      winPath(resolve(testNodeModules, 'bar/bar.js')),
    ),
  ).toEqual(
    `import _ from "${winPath(
      join(asbPath, 'bar.js'),
    )}";\nexport default _;\nexport * from "${winPath(
      join(asbPath, 'bar.js'),
    )}";`,
  );

  // import file without ext.
  mkdirSync(winPath(join(testNodeModules, 'xxx')));
  asbPath = winPath(join(testNodeModules, 'xxx', 'runtime.js'));
  writeFileSync(asbPath, 'export default "EXPORT"');
  expect(await figureOutExport(testPath, 'xxx/runtime')).toEqual(
    `import _ from "${asbPath}";\nexport default _;\nexport * from "${asbPath}";`,
  );

  // direct reference
  mkdirSync(winPath(join(testNodeModules, 'yyy')));
  mkdirSync(winPath(join(testNodeModules, 'yyy', 'dist')));
  asbPath = winPath(resolve(testNodeModules, 'yyy', 'dist', 'index.js'));
  writeFileSync(asbPath, 'exports.a = "1";');
  expect(await figureOutExport(testPath, asbPath)).toEqual(
    `import _ from "${asbPath}";\nexport default _;\nexport * from "${asbPath}";`,
  );
});
