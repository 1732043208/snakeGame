// 主进程
const {app, BrowserWindow, ipcMain, dialog,Menu} = require('electron')
const path = require('path')
const fs = require('fs')
const createTray = require('./tray')

let contextMenu = Menu.buildFromTemplate([
    {
        label:'Edit',
        submenu:[
            {
                label:'Undo',
                accelerator:'CmdOrCtrl+Z',
                role:'undo'
            },
            {
                label:'Redo',
                accelerator:'CmdOrCtrl+Y',
                role:'redo'
            },
            {
                type:'separator'
            },
            {
                label:'Cut',
                accelerator:'CmdOrCtrl+X',
            }
        ]
    }
 ])
function readFile() {
    return fs.readFileSync('D://hello.txt').toString()
}

function writeFile(_, data) {
    console.log(data)
    fs.writeFileSync('D://hello.txt', data)
}

function createWindow() {
    createTray()
    const win = new BrowserWindow({
        width: 1280,
        height: 960,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.resolve(__dirname, './preload.js')
        }
    })
    ipcMain.on('file-save', writeFile)
    ipcMain.handle('file-open', readFile)

    const wc = win.webContents
    // win.webContents.openDevTools() //打开开发者工具

    wc.on('context-menu', (e, params) => {
        console.log('params', params)

        // dialog.showMessageBox({
        //     title:'Message Box',
        //     message:'Please select an option',
        //     detail:'Message details.',
        //     buttons:['YES','NO','MAYBE','xixi']
        // })

        contextMenu.popup()
    })
    win.loadFile('./pages/menu/index.html')
}

app.on('ready', () => {
    createWindow()
})