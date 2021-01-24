//@ts-check
const nodeEnv = process.env.NODE_ENV
// 'test-dev' ... the environment used for running tests while developing tests
const isDev = nodeEnv === 'development' || nodeEnv === 'test-dev'
console.log('index.js NODE_ENV:', process.env.NODE_ENV)
// strange way of initialising sentry: https://github.com/getsentry/sentry-electron/issues/92#issuecomment-541689987

const electron = require('electron')
const { app, BrowserWindow, Menu, shell, dialog } = require('electron')
const path = require('path')
const url = require('url')
const ipc = electron.ipcMain
const fs = require('fs')

console.log('version infos:', process.versions)

const viewSection = {
  label: 'View',
  submenu: [
    {
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click(item, focusedWindow) {
        if (focusedWindow) focusedWindow.reload()
      }
    },
    {
      label: 'Toggle Developer Tools',
      accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
      click(item, focusedWindow) {
        if (focusedWindow) focusedWindow.webContents.toggleDevTools()
      }
    },

    {
      label: 'Show Help',
      click(item, focusedWindow) {
        focusedWindow.webContents.send('show-intro-help')
      }
    },
    {
      type: 'separator'
    },
    {
      role: 'resetzoom'
    },
    {
      role: 'zoomin'
    },
    {
      role: 'zoomout'
    },
    {
      type: 'separator'
    },
    {
      role: 'togglefullscreen'
    }
  ]
}

if (isDev) {
}

const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open workspace',
        accelerator: 'Cmd+O',
        click(item, focusedWindow) {
          dialog.showOpenDialog(
            {
              defaultPath: electron.app.getPath('userData') + path.sep + 'tests',
              properties: ['openDirectory']
            },
            function(dirs) {
              if (dirs !== undefined && dirs.length > 0) {
                win.webContents.send('load-workspace', dirs)
              }
            }
          )
        }
      },
      {
        label: 'Import test',
        accelerator: 'Cmd+T',
        click(item, focusedWindow) {
          dialog.showOpenDialog(
            {
              title: 'Select directory to import',
              properties: ['openDirectory']
            },
            function(files) {
              if (files !== undefined && files.length > 0) {
                win.webContents.send('import-test', files)
              }
            }
          )
        }
      }
    ]
  },
  viewSection,
  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  }
]

if (process.platform === 'darwin') {
  const name = app.getName()
  menuTemplate.unshift({
    label: name,
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services'
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })
}

app.disableHardwareAcceleration()

let win

app.on('ready', () => {
  console.log('app on ready!!!')

  if (isDev) {
    const sourceMapSupport = require('source-map-support')
    sourceMapSupport.install()
  }
  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  console.log('env: ' + nodeEnv)
  if (win === null) {
    createWindow()
  }
})

function createWindow() {
  var { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
  console.log('width x height: ', width, height)
  //width = 1280
  //height = 720

  win = new BrowserWindow({
    width,
    height,
    titleBarStyle: 'hidden',
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true
    }
  })
  win.once('ready-to-show', () => {
    //win.show();
  })

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  if (isDev) {
    console.log('load content from dev server...')
    //delay 1000ms to wait for webpack-dev-server start
    setTimeout(function() {
      win.loadURL(
        url.format({
          pathname: 'localhost:3000/main.html',
          protocol: 'http:',
          slashes: true
        })
      )
      win.webContents.openDevTools()
    }, 1000)
  } else {
    const fullPath = path.join(path.resolve(__dirname), 'main.html')
    const fullUrl = url.format({
      pathname: fullPath,
      protocol: 'file:',
      slashes: true
    })
    console.log('load content from main.html:', fullPath, 'url: ', fullUrl)
    win.loadURL(fullUrl)
  }
}
