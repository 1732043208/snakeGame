// 预加载脚本
const {contextBridge, ipcRenderer} = require('electron')
contextBridge.exposeInMainWorld('myAPI', {
    version: process.version,
    saveFile: (data) => {
        ipcRenderer.send('file-save', data)
    },
    openFile: () => {
        return ipcRenderer.invoke('file-open')
    },
})
console.log('preload')