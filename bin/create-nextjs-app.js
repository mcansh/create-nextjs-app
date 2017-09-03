#!/usr/bin/env node
const fs = require('fs');
const { green, dim } = require('chalk');
const { join } = require('path');
const args = require('args');
const clipboardy = require('clipboardy');
const { spawn } = require('../utils/exec');

args
  .option('new', 'Create a new directory and run the initializer')
  .option('skipInstall', 'Skips installation of dependencies')
  .option('npm', 'Use npm instead of yarn');


const flags = args.parse(process.argv);

const generatePkg = async () => {
  if (flags.new) {
    await spawn('mkdir', [flags.new]);
    await process.chdir(flags.new);
  }
  console.log(`${dim('[1/4]')} 📦  Creating package.json...`);
  await spawn('yarn', ['init']);
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const pkg = require(join(process.cwd(), 'package.json'));
  if (!pkg.dependencies) {
    pkg.dependencies = {};
  }
  if (!pkg.dependencies.next) {
    pkg.dependencies.next = 'latest';
  }
  if (!pkg.dependencies.react) {
    pkg.dependencies.react = 'latest';
  }
  if (!pkg.dependencies['react-dom']) {
    pkg.dependencies['react-dom'] = 'latest';
  }
  if (!pkg.dependencies['prop-types']) {
    pkg.dependencies['prop-types'] = 'latest';
  }
  if (!pkg.devDependencies) {
    pkg.devDependencies = {};
  }
  if (!pkg.devDependencies.eslint) {
    pkg.devDependencies.eslint = 'latest';
  }
  if (!pkg.devDependencies['eslint-config-airbnb']) {
    pkg.devDependencies['eslint-config-airbnb'] = 'latest';
  }
  if (!pkg.devDependencies['eslint-plugin-import']) {
    pkg.devDependencies['eslint-plugin-import'] = 'latest';
  }
  if (!pkg.devDependencies['eslint-plugin-jsx-a11y']) {
    pkg.devDependencies['eslint-plugin-jsx-a11y'] = 'latest';
  }
  if (!pkg.devDependencies['eslint-plugin-react']) {
    pkg.devDependencies['eslint-plugin-react'] = 'latest';
  }
  if (!pkg.scripts) {
    pkg.scripts = {};
  }
  if (!pkg.scripts.dev) {
    pkg.scripts.dev = 'next';
  }
  if (!pkg.scripts.build) {
    pkg.scripts.build = 'next build';
  }
  if (!pkg.scripts.start) {
    pkg.scripts.publish = 'next start';
  }
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, '\t'));
  return pkg;
};

const scaffold = () => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const pkg = require(join(process.cwd(), 'package.json'));
  console.log(`${dim('[2/4]')} 🌳  Creating basic architecture...`);
  fs.mkdirSync(join(process.cwd(), 'components'));
  fs.mkdirSync(join(process.cwd(), 'pages'));
  fs.mkdirSync(join(process.cwd(), 'layouts'));
  const metaComponent = `
import React from 'react';
import Head from 'next/head';

const Meta = () => (
  <Head>
    <title>${pkg.name}</title>
    <meta charSet="utf-8" />
    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
  </Head>
);

export default Meta;
  `.trim();

  const documentLayout = `
import React from 'react';
import PropTypes from 'prop-types';
import Meta from '../components/Meta';

const Document = ({ children }) => (
  <div>
    <Meta />
    <div>
      {children}
    </div>
  </div>
);

Document.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Document;
  `.trim();

  const indexPgae = `
import React from 'react';
import Document from '../layouts/Document';

const Index = () => (
  <Document>
    <h1>${pkg.name}</h1>
  </Document>
);

export default Index;
  `.trim();
  fs.writeFileSync(join(process.cwd(), 'layouts', 'Document.js'), documentLayout);
  fs.writeFileSync(join(process.cwd(), 'pages', 'index.js'), indexPgae);
  fs.writeFileSync(join(process.cwd(), 'components', 'Meta.js'), metaComponent);
};

const generateGitignore = () => {
  console.log(`${dim('[3/4]')} 📜  Creating default .gitignore...`);
  const gitignore = './.gitignore';
  if (!fs.existsSync(gitignore)) {
    const DEFAULT_GITIGNORE = `
node_modules
*.log
.DS_Store
.next
    `.trim();
    fs.writeFileSync(gitignore, DEFAULT_GITIGNORE);
  }
};

const installDependencies = async () => {
  console.log(`${dim('[4/4]')} 📦  Installing packages...`);
  if (flags.npm) {
    await spawn('npm', ['install']);
  } else {
    await spawn('yarn', ['install']);
  }
};

const congrats = async () => {
  await console.log(`${green('success')} 🎉  App initialized!`);
  if (!flags.s) {
    await clipboardy.writeSync(`cd ${process.cwd()} && npm run dev`);
    await console.log('run the command copied to the clipboard to get go into your new app');
  }
};

const generateProject = async () => {
  await generatePkg();
  await scaffold();
  await generateGitignore();
  if (!flags.skipInstall) await installDependencies();
  await congrats();
};

generateProject();
