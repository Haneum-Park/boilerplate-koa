const tsConfigPaths = require('tsconfig-paths');
const fs = require('fs');

const tsConfig = JSON.parse(fs.readFileSync('./tsconfig.build.json', 'utf8'));

tsConfigPaths.register({
  baseUrl: tsConfig.compilerOptions.outDir,
  paths: tsConfig.compilerOptions.paths,
});
