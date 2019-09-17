const {BrowserWindow} = require('electron');
const url = require('url')
const path = require('path')

class MainForm {
    constructor(w, h) {
        this.create_window(w, h);
        this.win.on('closed', () => {
            this.win = null
        })
    }

    load(view_html, cbz_filename) {
        this.win.filename = cbz_filename;
        this.win.loadURL(view_html);
    }
	
	back_to_browser() {
		var browser_path = url.format({
			pathname: path.join(__dirname, '../index.html'),
			protocol: 'file:',
			slashes: true
		})
		console.log("browser path = " + browser_path);
		
		this.win.loadURL(browser_path);
	}

    create_window(w, h) {
        this.win = new BrowserWindow({
            width:w, height:h,
            webPreferences: {
                nodeIntegration: true
            }
        });

        //this.win.setFullScreen(true);
        //this.win.setMenu(null);
    
        this.win.loadURL(url.format({
            pathname: path.join(__dirname, '../index.html'),
            protocol: 'file:',
            slashes: true
        }))
    }
}

module.exports = MainForm;
