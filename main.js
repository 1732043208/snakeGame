// 主进程
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs')

function readFile() {
    return fs.readFileSync('D://hello.txt').toString()
}
function writeFile(_, data) {
    console.log(data)
    fs.writeFileSync('D://hello.txt', data)
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 768,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.resolve(__dirname, './preload.js')
        }
    })
    ipcMain.on('file-save', writeFile)
    ipcMain.handle('file-open', readFile)
    win.loadFile('./pages/menu/index.html')
}

app.on('ready', () => {
    createWindow()
})