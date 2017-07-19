/**
 * Created by luhongyu on 2017/7/10.
 */

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    return date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + date.getHours() + seperator2 + date.getMinutes()
        + seperator2 + date.getSeconds();
}

var I64BIT_TABLE =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');

function hash(input) {
    var hash = 5381;
    var i = input.length - 1;
    if (typeof input === 'string') {
        for (; i > -1; i--)
            hash += (hash << 5) + input.charCodeAt(i);
    }
    else {
        for (; i > -1; i--)
            hash += (hash << 5) + input[i];
    }
    var value = hash & 0x7FFFFFFF;
    var retValue = '';
    do {
        retValue += I64BIT_TABLE[value & 0x3F];
    }
    while (value >>= 6);
    return retValue;
}

function hashUrl(url) {
    if (url.indexOf("file") === 0){
        url = url.replace(/^file:\/\/.*\/([^\/]+)\.mhtml/, "$1");
    }else{
        url = hash(url);
    }
    return url;
}

function bound(data) {
    if (data.x < 0)
        data.x = 0;
    if (data.y < 0)
        data.y = 0;
    var boundw = $(window).width();
    var boundh = $(window).height();
    if (data.x > boundw)
        data.x = boundw;
    if (data.y > boundh)
        data.y = boundh;
    return data;
}

function buildLogName() {
    return getNowFormatDate();
}
function getMousePos(ev) {
    var e = ev || window.event;
    var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
    var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    var clientLeft = document.body.clientLeft;
    var clientTop = document.body.clientTop;
    var x = e.pageX || e.clientX + scrollX - clientLeft;
    var y = e.pageY || e.clientY + scrollY - clientTop;
    return { 'x': x, 'y': y };
}