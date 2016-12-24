const ipc = require('electron').ipcRenderer
const storage = require('electron-json-storage');

const selectDirBtn = document.getElementById('select-class-import')

selectDirBtn.addEventListener('click', function (event) {
  ipc.send('open-class-import-dialog')
})

ipc.on('selected-class-import-directory', function (event, path) {
  document.getElementById('selected-class-import-file').innerHTML = `You selected: ${path}`
})

ipc.on('display-class-import-directory', function(event) {
    
    storage.get('class-data', function(err, data) {
        if (err) console.log("fetch class-data error!");
        else {
            var display = document.getElementById('displayed-class-import-file');
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

storage.get('class-data', function(err, data) {
    if (err) console.log("fetch class-data error!");
    else {
        if (!(data instanceof Array)) return;
        var display = document.getElementById('displayed-class-import-file');
        var content = "<p>您上次导入的数据如下：</p>";
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
