const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
const XLSX = require('xlsx')
const storage = require('electron-json-storage')

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

function calc_money(full_data, std_class, teacher_name, stu_count, comp_ratio, class_times) {
    for (let i = 0; i < full_data.length; i++) 
        if (full_data[i]['姓名'] == teacher_name) {
            let stu_base = full_data[i]['满班基准'];
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

ipc.on('calc-money-query-class', function (event, class_id) {
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
                            let list = [];
                            for (let i = 0; i < class_data.length; i++)
                                if (class_data[i]['班级编码'] == class_id) {
                                    let ret = calc_money(full_data, std_class, class_data[i]['授课教师'], class_data[i]['原班人数'], class_data[i]['续班率'], class_data[i]['课时']);
                                    list.push({
                                        '班级编码': class_id,
                                        '授课教师': class_data[i]['授课教师'],
                                        '满班率': (ret.full_ratio * 100).toFixed(1) + "%",
                                        '续班率': (class_data[i]['续班率'] * 100).toFixed(1) + "%",
                                        '奖金数': ret.money
                                    })
                                    tot_money += ret.money;
                                }
                            let result = {
                                'tot_money': tot_money,
                                'data_list': list
                            };
                            storage.set('money-class-data', result, function(err) {
                                if (err) throw err;
                                else {
                                    event.sender.send('display-money-query-class');
                                }
                            })
                        }
                    })
                }
            });
        }
    })
})

ipc.on('calc-money-query-teacher', function (event, teacher_name) {
    storage.get('class-data', function(err, class_data) {
        if (err) console.log('query teacher: class-data is missed!');
        else {
            storage.get('full-data', function(err, full_data) {
                if (err) console.log('full_data is missed!');
                else {
                    storage.get('std-class', function(err, std_class) {
                        if (err) console.log('std_class is missed');
                        else {
                            let tot_money = 0;
                            let list = [];
                            for (let i = 0; i < class_data.length; i++)
                                if (class_data[i]['授课教师'] == teacher_name) {
                                    let ret = calc_money(full_data, std_class, class_data[i]['授课教师'], class_data[i]['原班人数'], class_data[i]['续班率'], class_data[i]['课时']);
                                    list.push({
                                        '班级编码': class_data[i]['班级编码'],
                                        '授课教师': class_data[i]['授课教师'],
                                        '满班率': (ret.full_ratio * 100).toFixed(1) + "%",
                                        '续班率': (class_data[i]['续班率'] * 100).toFixed(1) + "%",
                                        '奖金数': ret.money
                                    })
                                    tot_money += ret.money;
                                }
                            let result = {
                                'tot_money': tot_money,
                                'data_list': list
                            };
                            storage.set('money-teacher-data', result, function(err) {
                                if (err) console.log('can\'t set money-teacher-data');
                                else {
                                    event.sender.send('display-money-query-teacher');
                                }
                            })
                        }
                    });

                }
            });
        }
    })
})