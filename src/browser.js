const {ipcMain} = require('electron')
const EFileType = require('./efiletype.js');
var fs = require('fs');

class Browser {
    constructor() {
        ipcMain.on('AppStart', (event) => {
            this.sendCurrentDirList(event.sender);
        })
    }

    sendCurrentDirList(sender) {
        var cwd = process.cwd();
        console.log("cwd = " + cwd);
        fs.readdir(cwd, function(err, items) {
            var elements = new Array();
            elements.push({name:"..", filetype:EFileType.Directory});
            
            for(var i=0; i<items.length; i++) {
                var fullpath = cwd + '/' + items[i];
                var extension = items[i].split('.').pop();
                var filetype = EFileType.Unknown;
                try {
                    filetype = fs.lstatSync(fullpath).isDirectory() == true ? EFileType.Directory : EFileType.File;
                }
                catch {
                    filetype = EFileType.Unknown;
                }
    
                console.log("filename = " + items[i] + ", type = " + filetype);
                if(filetype != EFileType.File || extension == "cbz")
                    elements.push({name:items[i], filetype:filetype});
            }
    
            elements = elements.sort((a, b) => {
                if (a.isDir == true && b.isDir == false)
                    return -1;
                else {
                    if (a.name > b.name) return 1;
                }
    
                return 1;
            });
            sender.send('DIRLIST', {cwd, elements});
        });
    }
}



module.exports = Browser;
