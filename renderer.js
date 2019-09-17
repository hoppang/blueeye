const {ipcRenderer} = require('electron')
const process = require('process');
const path = require('path')
const url = require('url')
const util = require('util')
const EFileType = require('./src/efiletype.js');
const driveutil = require('./lib/drive_util.js');

document.addEventListener("DOMContentLoaded", function(){
    ipcRenderer.send('AppStart');
    add_drive_list();
});

function add_drive_list() {
    var is_win = process.platform == 'win32';
    
    if (is_win) {
        driveutil.get_list().then((data) => {
            var container = document.getElementById('drive_list');
            for(i=0; i<data.length; i++) {
                var link_text = util.format("<a href='#' class='link_drive' onclick='change_drive(\"%s\");'>%s</a>", data[i], data[i]);
                container.innerHTML = container.innerHTML + link_text;
            }
        });
    }
}

function changeDir(dirname) {
    ipcRenderer.send('changeDir', dirname);
}

function change_drive(drive_letter) {
    alert(drive_letter);
    ipcRenderer.send('change_drive', drive_letter);
}

function view(filename, pageNo) {
    ipcRenderer.send('view', filename, pageNo);
}

function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}

function makeLink(dirname, item)
{
    var result = '';
    var name = item.name;
    var filetype = item.filetype;
    var fullpath = url.format({
        pathname: path.join(dirname, name),
        protocol: 'file:',
        slashes: true
    });
    fullpath = replaceAll(fullpath, "\\", "/");

    var absPath = path.resolve(dirname, name);
    absPath = replaceAll(absPath, '\\', '/');
    
    switch(filetype) {
        case EFileType.Unknown:
            result = util.format('<div>%s (NO PERMISSION)</div>', name);
            break;
        case EFileType.File:
            result = util.format('<div class="itemlist_item"><a class="link_file" href="#" onclick="view(\'%s\', %d);"><img class="itemlist_icon" src="./res/drawable-xxhdpi/round_menu_book_black_48dp.png"/>%s</a></div>', absPath, 0, name);
            break;
        case EFileType.Directory:
            result = util.format('<div class="itemlist_item"><a class="link_dir" href="#" onclick="changeDir(\'%s\');"><img class="itemlist_icon" src="./res/drawable-xxhdpi/round_folder_open_black_48dp.png"/>%s</a></div>', name, name);
            break;
        default:
            result = '<div>' + name + '(unaccessable)</div>';  
    }

    return result;
}

ipcRenderer.on('DIRLIST', (_event, _data) => {
    var list = Array.from(_data.elements);
    var str = '';
    var dirname = _data.cwd;

    document.getElementById('itemlist_header').innerHTML = dirname;
    
    for(var i=0; i < list.length; i++) {
        str = str.concat(makeLink(dirname, list[i]));
    }

    document.getElementById('itemlist_content').innerHTML = str;
});

