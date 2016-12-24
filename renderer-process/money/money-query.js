const ipc = require('electron').ipcRenderer
const storage = require('electron-json-storage');

const queryClassBtn = document.getElementById('select-money-query-class')
const queryTeacherBtn = document.getElementById('select-money-query-teacher')
const radioList = document.getElementsByName('query_money_level')

queryClassBtn.addEventListener('click', function (event) {
    console.log('value=', document.getElementById('input-money-query-class').value);
    ipc.send('calc-money-query-class', document.getElementById('input-money-query-class').value)
})

queryTeacherBtn.addEventListener('click', function (event) {
    console.log('value=', document.getElementById('input-money-query-teacher').value);
    ipc.send('calc-money-query-teacher', document.getElementById('input-money-query-teacher').value)
})

radioList.forEach(function(element) {
    element.addEventListener('click', function(event) {
        _radioList = document.getElementsByName('generate_money_level')
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

ipc.on('display-money-query-class', function(event) {
    storage.get('money-class-data', function(err, result) {
        if (err) console.log("fetch money-data error!");
        else {
            var data = result.data_list;
            var display = document.getElementById('display-money-query-class');
            var content = "<p>查询的结果如下：</p>";
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
            content += "<p>总奖金数为：" + result.tot_money + "</p>";
            display.innerHTML = content;
        }
    });
});

ipc.on('display-money-query-teacher', function(event) {
    storage.get('money-teacher-data', function(err, result) {
        if (err) console.log("fetch money-data error!");
        else {
            var data = result.data_list;
            var display = document.getElementById('display-money-query-teacher');
            var content = "<p>查询的结果如下：</p>";
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
            content += "<p>总奖金数为：" + result.tot_money + "</p>";
            display.innerHTML = content;
        }
    });
});

