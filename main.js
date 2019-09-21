const {app, ipcMain, remote} = require('electron')
const Browser = require('./src/browser.js');
const Viewer = require('./src/viewer.js');
const MainForm = require('./src/mainform.js');
const url = require('url')
const path = require('path')
var tmp = require('tmp')

// electron 앱 구조?
// main - renderer
// html은 두개, browser / viewer
// renderer는 html마다 둘 수 있지만 main은 하나뿐이다

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let form
let browser
let viewer

app.on('ready', init)
app.on('activate', init)
app.on('window-all-closed', () => {
    app.quit()
})

function init() {
    if (form == null) {
        form = new MainForm(1280, 720);
    }
    if (browser == null) {
        browser = new Browser();
    }
    if (viewer == null) {
        viewer = new Viewer();
	}
	
	if (process.argv.length > 2) {
		arg = process.argv[2];
		on_view_command(null, arg);
	}
}

ipcMain.on('changeDir', (event, dirname) => {
    process.chdir(dirname);
    browser.sendCurrentDirList(event.sender);
});

ipcMain.on('change_drive', (event, drive_letter) => {
    console.log("drive_letter = " + drive_letter);
    process.chdir(drive_letter);
    browser.sendCurrentDirList(event.sender);
});

function on_view_command(event, filename) {
    var view_html_path = url.format({
        pathname: path.join(__dirname, 'view.html'),
        protocol: 'file:',
        slashes: true
    })
    
    var tempDir = tmp.dirSync().name;

    form.load(view_html_path, filename);
    viewer.load(filename, tempDir);
}

ipcMain.on('view', on_view_command);

ipcMain.on('backToBrowser', () => {
	form.back_to_browser();
});

ipcMain.on('nextPage', (event) => {
    viewer.moveNext(event.sender);
});

ipcMain.on('prevPage', (event) => {
    viewer.movePrev(event.sender);
});

ipcMain.on('goto', (event, pageNo) => {
    console.log("goto " + pageNo);
    viewer.goto(event.sender, pageNo);
});


