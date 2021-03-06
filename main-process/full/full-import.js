const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
const storage = require('electron-json-storage')
const XLSX = require('xlsx')

ipc.on('open-full-import-dialog', function (event) {
  dialog.showOpenDialog({
    properties: ['openFile']
  }, function (files) {
    if (files) event.sender.send('selected-full-import-directory', files);
    else return;
    var workbook = XLSX.readFile(files[0]);
    var sheet_name_list = workbook.SheetNames;
    sheet_name_list.forEach(function(y) { /* iterate through sheets */
      var worksheet = workbook.Sheets[y];
      storage.set('full-data', XLSX.utils.sheet_to_json(worksheet, {raw: true}), function(err) {
          if (err) console.log(err);
          else event.sender.send('display-full-import-directory');
      });
    });
  })
})
