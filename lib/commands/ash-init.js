#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const Promise = require('bluebird')
const ncp = Promise.promisify(require('ncp').ncp)
const ora = require('ora')
const spawn = require('cross-spawn')

program.parse(process.argv)

let cl
let spinner

function install (modules = []) {
  return spawn.sync('yarn', ['add', ...modules], { stdio: 'inherit' })
}

Promise.resolve()
  .then(() => {
    spinner = ora('Initializing project').start()
    const source = path.join(__dirname, '..', 'blueprints', 'package.json')
    const destination = process.cwd()
    return ncp(source, destination)
  })
  .then(() => {
    spinner.text = 'Initialize project'
    spinner.succeed()
  })
  .then(() => {
    spinner.text = 'Scaffolding files'
    spinner.start()
    return Promise.all([
      ncp(path.join(__dirname, '..', 'blueprints', 'app'), path.join(process.cwd(), 'app')),
      ncp(path.join(__dirname, '..', 'blueprints', 'config'), path.join(process.cwd(), 'config')),
      ncp(path.join(__dirname, '..', 'blueprints') + '/package.json', process.cwd() + '/package.json'),
      ncp(path.join(__dirname, '..', 'blueprints') + '/.babelrc', process.cwd() + '/.babelrc')
    ])
  })
  .then(() => {
    spinner.text = 'Scaffold files'
    spinner.succeed()
  })
  .then(() => {
    spinner.text = 'Installing dependencies'
    spinner.start()
    cl = console.log
    console.log = function () {}
    install([
      'ash-core',
      'babel',
      'babel-cli',
      'babel-plugin-transform-es2015-modules-commonjs',
      'standard'
    ])
  })
  .then(() => {
    spinner.text = 'Install dependencies'
    spinner.succeed()
    console.log = cl
  })
  .then(() => {
    spinner.text = 'All done!'
    spinner.start()
    spinner.stopAndPersist('🦄 ')
  })
  .catch(err => {
    spinner.text = err.message
    spinner.stopAndPersist('✖')
  })
