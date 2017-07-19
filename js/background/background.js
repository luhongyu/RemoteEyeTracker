/**
 * Created by luhongyu on 2017/7/5.
 */

/**
 * 接受contentjs采集到的log信息，维护用户的log记录（本地存储），上传数据
 * 维护页面的记录状态（供popupjs同时控制多个页面的记录）
 *
 */

var USER_LOG_RECORDS = {};
var USER_ID = localStorage.getItem("USER_ID") || "default";
var GLOBAL_KEY = localStorage.getItem("GLOBAL_KEY");

loadLogLocal();

chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
    /**
     * request.key : ['LOG_BEGIN', 'LOG_END', ]
     */

    if (request.key === "PAGE_LOG_BEGIN") {}
    else if (request.key === "PAGE_LOG_END"){
        /**
         * get mhtml -> save logdata
         */
        let tab = sender.tab;
        let url_id = hashUrl(tab.url);
        let mhtml = null;
        let page_mhtml_id = USER_ID + "_" + request.log_name + "_" + url_id;
        chrome.pageCapture.saveAsMHTML({tabId: tab.id}, function(mhtmlData) {
            var reader = new window.FileReader();
            reader.onloadend = function() {
                mhtml = reader.result;
                ajaxPageMhtml(page_mhtml_id, mhtml);
            };
            reader.readAsBinaryString(mhtmlData);
        });
        saveLogLocal(request.log_name, tab.url, request.log_data, page_mhtml_id, url_id);
    }
    //TODO: no use
    else if (request.key === "LOG_BEGIN"){
        GLOBAL_KEY = true;
        localStorage.setItem("GLOBAL_KEY", "true");
    }
    else if (request.key === "LOG_END"){
        GLOBAL_KEY = false;
        localStorage.setItem("GLOBAL_KEY", "false");
    }

});


function saveLogLocal(log_name, log_url, log_data, page_mhtml_id, url_id) {
    if (!USER_LOG_RECORDS.hasOwnProperty(url_id)){
        USER_LOG_RECORDS[url_id] = {};
    }
    let log_record = {
        "submit_time": getNowFormatDate(),
        "log_name": log_name,
        "log_url": log_url,
        "log_data": log_data,
        "page_mhtml_id": page_mhtml_id,
        "url_id": url_id
    };
    USER_LOG_RECORDS[url_id][log_name] = log_record;

    let local_key = "LOG_" + USER_ID + "_" + log_name + "_" + url_id;
    let local_save = {};
    local_save[local_key] = log_record;

    chrome.storage.local.set(
        local_save,
        function() {
            console.log("SAVE logdata: " + local_key);
        }
    );
}
function loadLogLocal() {
    chrome.storage.local.get(null, function (logdic) {
        let tks = Object.getOwnPropertyNames(logdic);
        console.log(tks);
        for (let i = 0; i < tks.length; i++){
            let tk = tks[i];
            console.log(tk);
            if (tk.indexOf("LOG") === 0){
                let tl = tk.split("_");
                let user_id = parseInt(tl[1]);
                let url_id = tl[3];

                if (user_id === USER_ID){
                    if (!USER_LOG_RECORDS.hasOwnProperty(url_id)){
                        USER_LOG_RECORDS[url_id] = {};
                    }
                    USER_LOG_RECORDS[url_id][logdic[tk].log_name] = logdic[tk];
                }
            }
        }
    })
}

function ajaxPageMhtml(page_id, mhtml) {
    var mhtml_url = "http://127.0.0.1:2018/mhtml/";
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: mhtml_url,
        user_id: USER_ID,
        data: {
            "page_id": page_id,
            "mhtml": mhtml
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}
function ajaxLogMessage(log_record) {
    var log_url = "http://127.0.0.1:2018/log/";
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: log_url,
        user_id: USER_ID,
        data: {
            "log_record": JSON.stringify(log_record)
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}

/**
 * For p_popup.js
 */
function getState() {
    if (GLOBAL_KEY){
        return "IN_RECORDING";
    }else{
        return "NOT_RECORDING";
    }
}
function getRecordNames(url_id) {
    if (USER_LOG_RECORDS.hasOwnProperty(url_id)){
        return Object.getOwnPropertyNames(USER_LOG_RECORDS[url_id])
    }
    return [];
}
function getUserRecords() {
    let recs = [];
    let turls = Object.getOwnPropertyNames(USER_LOG_RECORDS);
    for (let i = 0; i < turls.length; i++) {
        let turl = turls[i];
        let lognames = getRecordNames(turl);
        for (let i = 0; i < lognames.length; i++){
            let trec = USER_LOG_RECORDS[turl][lognames[i]];
            recs.push({
                "url": trec.log_url,
                "log_name": trec.log_name
            });
        }
    }
    return recs;
}

function getPageRecord(tab, logname) {
    var url_id = hashUrl(tab.url);
    if (USER_LOG_RECORDS.hasOwnProperty(url_id)){
        if (USER_LOG_RECORDS[url_id].hasOwnProperty(logname)) {
            return USER_LOG_RECORDS[url_id][logname].log_data;
        }else{
            return [];
        }
    }else{
        return [];
    }
}

// TODO: onUpdated