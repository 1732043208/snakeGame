const {Tray, app,Menu} = require('electron')

function createTray() {
    const tray = new Tray('./Logo.ico')
    tray.setToolTip('我的应用')
    tray.on('click', (e) => {
        if (e.shiftKey) app.quit()
    })
    tray.setContextMenu(Menu.buildFromTemplate([
        {label: '设置'},
        {label: '退出'}
    ]))
}

module.exports = createTray
