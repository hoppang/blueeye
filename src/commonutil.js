
function goodbye() {
	const {remote} = require('electron')
    remote.getCurrentWindow().close();
}
