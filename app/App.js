import React, { Component } from 'react'
import { HashRouter, Route } from 'react-router-dom'
import { hot } from 'react-hot-loader/root'
import { createMuiTheme, MuiThemeProvider, withStyles } from '@material-ui/core/styles'
const path = require('path')
import electron from 'electron'

//import { recognize } from 'ocr'

import fs from 'fs-extra'
import { Button } from '@material-ui/core'

const theme = createMuiTheme({})

const drawerWidth = 250

const styles = {}

class App extends Component {
  state = {
    result: ''
  }

  constructor(props) {
    super(props)

    this.stores = {
      dbStore: props.dbStore,
      uiStore: props.uiStore
    }

    this.appVersion = electron.remote.app.getVersion()
    // make sure the folder structure is created for saving files
  }

  componentDidMount = () => {}

  componentWillMount = () => {}

  setResult = result => {
    console.log('ocr result: ', result)
    this.setState({ result })
  }

  testOcr = () => {
    const { recognize } = require('node-native-ocr')

    const filepath = path.join(electron.remote.app.getAppPath(), 'static', '505.jpg')
    console.time('recognize')

    fs.readFile(filepath)
      .then(recognize)
      .then(result => {
        console.timeEnd('recognize')
        this.setResult(result)
      })
  }

  render() {
    const { classes } = this.props
    return (
      <MuiThemeProvider theme={theme}>
        <HashRouter>
          <React.Fragment>
            <div id="window-drag-bar" className="draggable-area" />
            <Button style={{ marginTop: 40 }} onClick={() => this.testOcr()}>
              Test ocr
            </Button>
            <div>result: {this.state.result}</div>
          </React.Fragment>
        </HashRouter>
      </MuiThemeProvider>
    )
  }
}
export default hot(withStyles(styles)(App))
