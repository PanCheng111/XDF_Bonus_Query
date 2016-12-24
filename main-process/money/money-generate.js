const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
const storage = require('electron-json-storage')
const XLSX = require('xlsx')
var fs = require('fs')
var base64 = require('base64-js')
var Docxtemplater = require('docxtemplater')


const std_dp = [[0,0,20,40,60,80,100,120,140,160,180,200],
			[20,40,60,80,100,120,140,160,180,200,220,240],
			[60,80,100,120,140,160,180,200,220,240,260,280],
			[100,120,140,160,180,200,220,240,260,280,300,320],
			[140,160,180,200,220,240,260,280,300,320,340,360]];

function calc_std(std_class, full, comp) {
    if (std_class == 1) comp -= 0.1;
    if (comp < 0.4 || full < 0.5) return 0;
    let row = 0, column = 0;
	if (comp >= 0.8) row = 5;
	else if (comp >= 0.7) row = 4;
	else if (comp >= 0.6) row = 3;
	else if (comp >= 0.5) row = 2;
	else if (comp >= 0.4) row = 1;
				
	if (full >= 1.6) column = 12;
	else if (full >= 1.5) column = 11;
	else if (full >= 1.4) column = 10;
	else if (full >= 1.3) column = 9;
	else if (full >= 1.2) column = 8;
	else if (full >= 1.1) column = 7;
	else if (full >= 1.0) column = 6;
	else if (full >= 0.9) column = 5;
	else if (full >= 0.8) column = 4;
	else if (full >= 0.7) column = 3;
	else if (full >= 0.6) column = 2;
	else if (full >= 0.5) column = 1;

	return std_dp[row - 1][column - 1];
}

function calc_money(name_base, std_class, teacher_name, stu_count, comp_ratio, class_times) {
    if (name_base[teacher_name]) {
        let stu_base = name_base[teacher_name];
        let full_ratio = stu_count / stu_base;
        let std_money = calc_std(std_class, full_ratio, comp_ratio);
        return {
            'full_ratio': full_ratio,
            'money': std_money * class_times
        }
    }
    return {
        'full_ratio': 0,
        'money': 0
    }
}

function generate_money(dir) {
    storage.get('class-data', function(err, class_data) {
        if (err) console.log('query class: class-data is missed!');
        else {
            storage.get('full-data', function(err, full_data) {
                if (err) console.log('full-data is missed!');
                else {
                    storage.get('std-class', function(err, std_class) {
                        if (err) console.log('std_class is missed');
                        else {
                            let tot_money = 0;
                            var _headers = Object.keys(class_data[0]);
                            _headers.push("奖金数");
                            let name_base = {};
                            for (let i = 0; i < full_data.length; i++) {
                                name_base[full_data[i]['姓名']] = full_data[i]['满班基准'];
                            }
                            for (let i = 0; i < class_data.length; i++) {
                                let ret = calc_money(name_base, std_class, class_data[i]['授课教师'], class_data[i]['原班人数'], class_data[i]['续班率'], class_data[i]['课时']);
                                tot_money += ret.money;
                                class_data[i]['奖金数'] = ret.money;
                            }
                            let headers = {};
                            for (let i = 0; i < _headers.length; i++) {
                                let addr = XLSX.utils.encode_cell({r: 0, c: i});
                                let obj = {v: _headers[i]};
                                headers[addr] = obj;
                            }
                            let data = {};
                            for (let i = 0; i < class_data.length; i++) {
                                for (let j = 0; j < _headers.length; j++) {
                                    let addr = XLSX.utils.encode_cell({r: i + 1, c: j});
                                    let obj = {v: class_data[i][_headers[j]]};
                                    data[addr] = obj;
                                }
                            }
                            // 合并 headers 和 data
                            var output = Object.assign({}, headers, data);
                            // 获取所有单元格的位置
                            var outputPos = Object.keys(output);
                            // 计算出范围
                            var ref = outputPos[0] + ':' + outputPos[outputPos.length - 1];
                            // 构建 workbook 对象
                            var wb = {
                                SheetNames: ['Sheet1'],
                                Sheets: {
                                    'Sheet1': Object.assign({}, output, { '!ref': ref })
                                }
                            };
                            // 导出 Excel
                            XLSX.writeFile(wb, dir + '/奖金明细表.xlsx');
                            dialog.showMessageBox({
                                type: 'info',
                                buttons: ['知道了'],
                                title: '保存成功',
                                message: '奖金明细表已经输出到指定目录下。',
                                cancelId: 0,
                            });
                        }
                    })
                }
            });
        }
    })
}


ipc.on('open-money-generate-dialog', function (event) {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }, function (files) {
        if (files) event.sender.send('selected-money-generate-directory', files);
        else return;
        var dir = files[0];
        generate_money(dir);
    })
})
