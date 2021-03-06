import { app, BrowserWindow } from 'electron'
import rimraf from 'rimraf'

import path from 'path'
import fs from 'fs';

(async () => {
  let mainWindow = null
  const appSavePath = path.resolve(`${app.getPath('appData')}/net64plus`)
  if (!fs.existsSync(appSavePath)) {
    fs.mkdirSync(appSavePath)
  }
  global.save = {
    appSavePath
  }
  if (fs.existsSync(path.join(appSavePath, 'save.json'))) {
    try {
      const appSaveData = JSON.parse(fs.readFileSync(path.join(appSavePath, 'save.json')))
      if (appSaveData == null) {
        await new Promise(resolve => {
          rimraf(appSavePath, err => {
            if (err) {
              console.log(err)
            } else {
              fs.mkdirSync(appSavePath)
            }
            resolve()
          })
        })
      } else {
        global.save.appSaveData = appSaveData
      }
    } catch (err) {
      // TODO find cause of corrupted appdata
    }
  }

  const onReady = () => {
    mainWindow = new BrowserWindow({
      width: process.env.NODE_ENV === 'development' ? 1100 : 670,
      height: 840,
      icon: path.join(__dirname, 'img/icon.png'),
      title: `Net64+ ${process.env.VERSION}`,
      webPreferences: {
        webSecurity: false,
        nodeIntegrationInWorker: true
      }
    })

    mainWindow.loadURL(path.normalize(`file://${__dirname}/index.html`))

    if (process.env.NODE_ENV === 'development') {
      require('electron-debug')({
        showDevTools: true
      })
      mainWindow.webContents.openDevTools()
    }
  }

  app.on('ready', onReady)

  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('activate', () => {
    onReady()
  })

  app.on('uncaughtException', (err) => {
    fs.writeFileSync('./error_log.txt', err)
    app.quit()
  })
})()
