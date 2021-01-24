//@ts-check
const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
// here is some documentation of webdriverio client:
// http://v4.webdriver.io/v4.0/api/action/click.html

function checkLog(app) {
  app.client.getRenderProcessLogs().then(function(logs) {
    logs
      .filter(entry => /*entry.level === 'WARNING' || */ entry.level === 'ERROR')
      .forEach(function(entry) {
        console.log('\nERROR FOUND in log:')
        console.log('Log message:' + entry.message)
        //console.log('log.source: ' + entry.source)
        //console.log('log.level:' + log.level)
        console.log('\n')
      })
  })
}
describe('Application launch', function() {
  this.timeout(60 * 1000) // 60 secs

  before(async function() {
    const app = new Application({
      // Your electron path can be any binary
      // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
      // But for the sake of the example we fetch it from our node_modules.
      path: electronPath,

      // Assuming you have the following directory structure

      //  |__ my project
      //     |__ ...
      //     |__ main.js
      //     |__ package.json
      //     |__ index.html
      //     |__ ...
      //     |__ test
      //        |__ AppStart.js  <- You are here! ~ Well you should be.

      // The following line tells spectron to look and use the main.js file
      // and the package.json located 1 level above.
      args: [path.join(__dirname, '../index.js')]
    })

    this.app = await app.start()
    // set the focus to the relevant window.
    //@ts-ignore
    const handles = await app.client.windowHandles()
    //console.log('window handles:', handles)

    //with dev tools open in the main window, we need to select like this: this.app.client.window(handles.value[1])
    this.app.client.window(handles.value[0])

    //this seems to be a bug of spectron. it's not working: this.app.client.webContents.closeDevTools()
    this.click = async (selector, args) => {
      try {
        await this.app.client.click(selector, args)
      } catch (e) {
        console.error(`Error while trying to click on '${selector}'!`)
        throw e
      }
    }
  })

  after(function() {
    if (this.app && this.app.isRunning()) {
      checkLog(this.app)
      return this.app.stop()
    }
  })

  it('shows an initial window', function() {
    return this.app.client.getWindowCount().then(function(count) {
      assert.equal(count, 2)

      // Please note that getWindowCount() will return a higher number if `dev tools` are opened.
    })
  })

  it('check and close startup dialogs', async function() {
    //console.log('windowHandle:', await this.app.client.windowHandle())
    //await this.app.client.waitForExist('#recordNewButton', 20000)
    await this.app.client.waitForExist('#introDialogCloseButton', 20000)

    await this.app.client.click('#introDialogCloseButton')

    await this.app.client.click('#askForJoyRideDialogCancelButton')
    await this.app.client.pause(2000) // wait for modal to close (otherwise the next test fails)
    return assert.equal(await this.app.client.getText('#recordNewButton'), 'RECORD NEW TEST')
  })

  it('record three click steps and replay them', async function() {
    // wait for connection
    await this.app.client.waitForExist('#deviceConnectorStatusLabel', 10000)
    const connectionLabelText = await this.app.client.getText('#deviceConnectorStatusLabel')
    assert.equal(connectionLabelText, 'Connected to Pixel 3a')

    await this.app.client.waitForExist('#canvas', 5000)
    await this.click('#recordNewButton')
    await this.click('#canvas', { x: 10, y: 10 })
    await this.click('#canvas', { x: 10, y: 10 })
    await this.click('#canvas', { x: 10, y: 10 })
    await this.app.client.waitForExist('.click', 2000)
    await this.click('#pauseButton')
    await this.click('#playButton')
    await this.app.client.waitForExist('.success', 5000)
    await this.app.client.waitForExist('#playButton', 10000)
    await this.app.client.pause(3000) // wait for success animation to finish
    await this.click('.success')
    await this.click('#nextExecutionResultButton')
    await this.app.client.pause(1000)
    await this.click('#closeDebugDialogButton')
    await this.click('#closeTestButton')
    await this.click('#saveTestDialogDiscardButton')
    return true
  })

  it('record a single click step and discard test', async function() {
    // wait for connection
    await this.app.client.waitForExist('#deviceConnectorStatusLabel', 10000)
    const connectionLabelText = await this.app.client.getText('#deviceConnectorStatusLabel')
    assert.equal(connectionLabelText, 'Connected to Pixel 3a')

    await this.app.client.waitForExist('#canvas', 5000)
    await this.click('#canvas', { x: 10, y: 10 })
    await this.click('#recordNewButton')
    await this.click('#canvas', { x: 10, y: 10 })
    await this.app.client.waitForExist('.click', 2000)
    await this.click('#closeTestButton')
    await this.click('#saveTestDialogDiscardButton')
    return true
  })

  it('click through menu', async function() {
    await this.app.client.waitForExist('#mainMenuLibraryMenuItem', 5000)
    await this.app.client.click('#mainMenuLibraryMenuItem')
    await this.app.client.click('#mainMenuBatchRunMenuItem')
    await this.app.client.click('#mainMenuRecordMenuItem')
    await this.app.client.waitForExist('#recordNewButton', 5000)

    return assert.equal(await this.app.client.getText('#recordNewButton'), 'RECORD NEW TEST')
  })

  /*
  it('display window handles', async function() {
    console.log('window handles:', await this.app.client.windowHandles())
  })*/
})
