/**
 * Created by luhongyu on 2017/7/5.
 */

/**
 * 提供接口（供popup页面调用），开始／停止，重放
 *
 * 调用 c_player.js, c_tracker.js
 */

/**
 * Global Variables
 *
 */
var START_TIME = new Date();
var PAGE_RECORDS = {};
var NOW_RECORD = "";
var RECORD_KEY = false;

var events = [];
var gaze_list = [];


/**
 * ask background.js for page key
 */

getGlobalKey();
function getGlobalKey() {
    chrome.extension.sendRequest({"key": "GLOBAL_KEY"}, function(response) {
        RECORD_KEY = response["GLOBAL_KEY"];
        console.log(RECORD_KEY);
    });
}

/**
 * Operation Functions
 */
function log_begin() {
    beginRecording();
}
function log_end() {
    endRecording();
}
function replay(logname) {
    playSequence(logname);
}

$(function(){
    $("body").append('<base target="_blank"/>');
    if (RECORD_KEY){
        log_begin();
    }
});