const ipc = require('electron').ipcRenderer
const storage = require('electron-json-storage')

const selectDirBtn = document.getElementById('select-full-import')

selectDirBtn.addEventListener('click', function (event) {
  ipc.send('open-full-import-dialog')
})

ipc.on('selected-full-import-directory', function (event, path) {
  document.getElementById('selected-full-import-file').innerHTML = `You selected: ${path}`
})

ipc.on('display-full-import-directory', function(event) {
    
    storage.get('full-data', function(err, data) {
        if (err) console.log("fetch full-data error!");
        else {
            var display = document.getElementById('displayed-full-import-file');
            var content = "<table class='table'>";
            var head = data[0];
            content += "<tr>";
            for (let i in head) {
                content += "<td>" + i + "</td>";
            }
            content += "</tr>";
            data.forEach(function(element) {
                content += "<tr>";
                for (let i in element) content += "<td>" + element[i] + "</td>";
                content += "</tr>";
            });
            content += "</table>";
            display.innerHTML = content;
        }
    });
})

storage.get('full-data', function(err, data) {
    if (err) console.log("fetch full-data error!");
    else {
        if (!(data instanceof Array)) return;
        var display = document.getElementById('displayed-full-import-file');
        var content = "<p>您上次录入的数据如下：</p>";
        content += "<table class='table'>";
        var head = data[0];
        content += "<tr>";
        for (let i in head) {
            content += "<td>" + i + "</td>";
        }
        content += "</tr>";
        data.forEach(function(element) {
            content += "<tr>";
            for (let i in element) content += "<td>" + element[i] + "</td>";
            content += "</tr>";
        });
        content += "</table>";
        display.innerHTML = content;
    }
});