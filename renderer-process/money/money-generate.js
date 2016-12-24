const ipc = require('electron').ipcRenderer
const storage = require('electron-json-storage');

const radioList = document.getElementsByName('generate_money_level')

radioList.forEach(function(element) {
    element.addEventListener('click', function(event) {
        _radioList = document.getElementsByName('query_money_level')
        _radioList[parseInt(event.target.value)].click();
        storage.set('std-class', event.target.value, function(err) {
            if (err) console.log("click can't set std-class");
        })
    })
});

storage.get('std-class', function(err, data) {
    if (err || !(data instanceof Number)) {
        storage.set('std-class', 0, function(err) {
            if (err) console.log("can't set std-class");
            else radioList[0].checked = true;
        })
    }
    else {
        console.log('checked data=', parseInt(data));
        radioList[parseInt(data)].checked = true;
    }
});

const selectDirBtn = document.getElementById('select-money-generate')

selectDirBtn.addEventListener('click', function (event) {
  ipc.send('open-money-generate-dialog')
})

ipc.on('selected-money-generate-directory', function (event, path) {
  document.getElementById('selected-money-generate-file').innerHTML = `文件保存路径: ${path}`
})

