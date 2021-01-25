/**
 * This script takes care of resolving and packaging dependencies of opencv
 * For some reason they are not found in the opencv-build folder, but in /usr/shared...
 * MacOS provides ways to tell libraries where to find dependencies, so what we do here is to
 * 1. iterate all opencv libraries
 * 2. for each of them check for dependencies in /usr/...
 * 3. copy each of those dependencies to our opencv-build/../dependencies dir
 * 4. tell the opencv libraries to look in the opencv-build/../dependencies dir instead of in /usr/...
 * 5. go through all the libraries in opencv-build/../dependencies and check for even more dependencies, take care of them the same way (see steps 1-4)
 * 6. again: go through all the libraries in opencv-build/../dependencies and check for even more dependencies, take care of them the same way (see steps 1-4)
 * 7. again: go through all the libraries in opencv-build/../dependencies and check for even more dependencies, take care of them the same way (see steps 1-4)
 * At this point I am still not sure if I really need all these dependencies (the sum up to 85Mb), but this way I got rid of my errors
 *
 * Huge thanks to Jakob Schindegger, who provided me with insights on how osx libraries are working and a great starting point here: https://github.com/fakob/MoviePrint_v004/blob/master/scripts/ffmpeg.js
 */
const path = require('path')
const shell = require('shelljs')

// good article about rpath, otool, ...: https://medium.com/@donblas/fun-with-rpath-otool-and-install-name-tool-e3e41ae86172
// https://wincent.com/wiki/@executable_path,_@load_path_and_@rpath
// cross platform variables
const projectRoot = shell.pwd().stdout
console.log('Dependency Fixer by Stephan Petzl')
console.log('=================================\n')
console.log('projectRoot: ' + projectRoot)

function fixDepsOfModule(moduleBinaryPath) {
  const dependencyDirName = 'dependencies'
  const copyLibsToPath = path.join(moduleBinaryPath, dependencyDirName)

  console.log('moduleBinaryPath: ' + moduleBinaryPath)
  console.log('copyLibsTo: ' + copyLibsToPath)
  shell.mkdir('-p', copyLibsToPath)

  if (false && shell.ls(copyLibsToPath).length > 0) {
    console.log('Dependencies fixed already, no need to rerun')
  } else {
    fixDeps(moduleBinaryPath, copyLibsToPath, dependencyDirName)
    fixDeps(copyLibsToPath, copyLibsToPath, '')
    fixDeps(copyLibsToPath, copyLibsToPath, '')
    fixDeps(copyLibsToPath, copyLibsToPath, '')
  }
}
// start directory of recursive dependency search
//const opencv4nodejsDllDir = path.resolve(projectRoot, 'node_modules/opencv4nodejs/build/Release/') // place where 'opencv4nodejs.node' is located
// path to the directory which contains the dependencies of the .node file ( on mac that's .dylib files on windows .dll files)

//const opencvDllDir = path.resolve(projectRoot, 'node_modules/opencv-build/opencv/build/x64/vc15/bin/') // for windows

function fixDeps(dirPath, copyLibsToPath, dependencyDirName) {
  // Copying ffmpeg_version=3.4.2 into dist folder and change library linking if necessary
  console.info('checking all dylib files in given directory...')
  const dylibs = shell.ls(dirPath)
  const allDeps = []
  dylibs
    .filter(file => {
      return file.indexOf('dylib') != -1 || file.indexOf('node') != -1
    })
    .forEach(dylibFilename => {
      const dylib = dirPath + '/' + dylibFilename
      console.log(`checking outer dependencies of file ${dylib}`)
      const outerDeps = shell
        .exec(`otool -l ${dylib} | grep 'name /usr'`)
        .stdout.split('\n')
        .filter(dep => {
          return dep != ''
        })

      if (outerDeps.length > 0) {
        //shell.exec(`install_name_tool -add_rpath @loader_path/${dependencyDirName}`);
      }
      outerDeps.forEach(depLine => {
        var regex = /name (.+?(?=\ \(offset))/g // transform "name /usr/lib/libc++.1.dylib (offset 24)" -> "/usr/lib/libc++.1.dylib"
        var depfilePath = regex.exec(depLine)[1] // "/usr/lib/libc++.1.dylib"
        var depfileName = depfilePath.replace(/^.*[\\\/]/, '')

        if (!allDeps.find(e => e == depfilePath)) {
          // if not added already -> add it
          allDeps.push(depfilePath)
          console.log(`    copying outer dependency ${depfilePath} to ${copyLibsToPath}`)
          shell.cp('-n', depfilePath, copyLibsToPath)
        }
        shell.chmod('-v', '666', dylib)
        const fixCommand = `install_name_tool -change ${depfilePath} @loader_path/${dependencyDirName}/${depfileName} ${dylib}`
        console.log('    fix with command: ' + fixCommand)
        shell.exec(fixCommand)
      })

      console.log(`\n\n`)
    })
  console.info('All outer dependencies:')
  console.log(allDeps)
  return allDeps
}

if (process.platform === 'darwin') {
  // first check if the dependencies where fixed already:
  console.log('Checking dependency dir...')
  //fixDepsOfModule(path.resolve(projectRoot, 'node_modules/opencv-build/opencv/build/lib/'))
  fixDepsOfModule(path.resolve(projectRoot, 'node_modules/node-native-ocr/build/Release/'))
} else if (process.platform === 'win32') {
  console.error('This is not inteded to be run on windows.')
}
