const StreamZip = require('node-stream-zip')
const path = require('path')
const fs = require('fs');

class Viewer {
    constructor() {

    }
    
    load(filename, tempDir) {
        this._tempDir = tempDir;
        this._currentPage = -1;
        this._entries = new Array();
        this._zip = new StreamZip({file: filename, storeEntries: true});
        this._zip.on('ready', () => {
            // console.log('entry count: ' + this._zip.entriesCount);
            for (const entry of Object.values(this._zip.entries())) {
                this._entries.push(entry.name);
            }
        });
    }

    getFilename(index) {
        if (index < 0 || index >= this._entries.length)
            return "";

        return this._entries[index];
    }

    _loadPage(eventSender) {
        var index = this._currentPage;
        var totalPage = this._entries.length;
        var filename = this._entries[index];
        var filepath = path.join(this._tempDir, filename);
        
        var indexToPass = Number(index) + 1;
        console.log("indexToPass = " + indexToPass);

        if (fs.existsSync(filepath)) {
            // console.log("file already exists: " + filepath);
            eventSender.send('loadNextPageComplete', filepath, indexToPass, totalPage);
        } else {
            this._zip.extract(filename, filepath, err => {
                console.log(err ? 'extractZip: failed - ' + err : 'extractZip: success');
                if (this._currentPage == index) {
                    console.log("complete signal " + filepath);
                    eventSender.send('loadNextPageComplete', filepath, indexToPass, totalPage);
                }
            });
        }
    }

    moveNext(eventSender) {
        var currentPage = Number(this._currentPage);
        var totalPage = Number(this._entries.length);
        console.log("movenext: " + currentPage + " / " + totalPage);
        if (currentPage + 1 < totalPage) {
            this._currentPage = currentPage + 1;
            this._loadPage(eventSender);
        }
    }

    movePrev(eventSender) {
        if (this._currentPage > 0) {
            this._currentPage = this._currentPage - 1;
            this._loadPage(eventSender);
        }
    }

    _validatePageNo(pageNo) {
        if (pageNo < 0)
            return 0;
        if (pageNo >= this._entries.length)
            return this._entries.length - 1;
        
        return pageNo;
    }
    
    goto(eventSender, pageNo) {
        this._currentPage = this._validatePageNo(pageNo);
        console.log("new currentpage = " + this._currentPage);
        this._loadPage(eventSender);
    }
}

module.exports = Viewer;
