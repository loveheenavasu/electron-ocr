//@ts-check
import React from 'react'
import { render } from 'react-dom'
import _ from 'lodash'

import App from './App'
import log from 'loglevel'

const electron = require('electron')
const ipc = electron.ipcRenderer

const fs = require('fs')

log.setLevel('DEBUG')

function renderApp(App) {
  render(<App />, document.getElementById('root'))
}


renderApp(App)

if (module.hot) {
  // @ts-ignore
  module.hot.accept()
}