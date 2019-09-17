const {ipcRenderer} = require('electron')

let totalPage = 0;

document.addEventListener("DOMContentLoaded", function(){
    ipcRenderer.send('nextPage');
});

document.addEventListener('mousewheel', (event) => {
    if (event.wheelDelta < 0) {
        nextPage();
    }
    else if (event.wheelDelta > 0) {
        prevPage();
    }
});

ipcRenderer.on('loadNextPageComplete', (event, filepath, index, totalPage) => {
    var canvas = document.getElementById("canvas");
    canvas.src = filepath + "?" + new Date().getTime();
    var indicator = document.getElementById("pageIndicator");
    indicator.innerHTML = index + " / " + totalPage;

    var pageSlider = document.getElementById("pageSlider");
    pageSlider.max = totalPage - 1;
    pageSlider.value = index - 1;
});

function nextPage() {
    ipcRenderer.send('nextPage');
}

function prevPage() {
    ipcRenderer.send('prevPage');
}

function onChangeSlider() {
    var slider = document.getElementById("pageSlider");
    var value = slider.value;
    ipcRenderer.send('goto', value);
}

function backToBrowser() {
    ipcRenderer.send('backToBrowser');
}
