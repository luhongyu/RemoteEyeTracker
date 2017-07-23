/**
 * Created by luhongyu on 2017/7/21.
 */

// Global Variables
var START_TIME = performance.now();
var PAGE_RECORDS = {};
var NOW_RECORD = "";
var CALIBRATION = true;

// Page Init
var RECORD_KEY = localStorage.getItem("GLOBAL_KEY");
var CLM_KEY = true; // control clm
console.log("RECORD_KEY: " + RECORD_KEY);

// zIndex
var INDEX_MASK = 200;
var INDEX_VIDEO = 201;
var INDEX_CLM = 202;
var INDEX_CAL = 203;
var INDEX_CURSOR = 204;

// Local Variables
var events = [];
var gaze_list = [];

//
var MIN_MOUSE_TRACKER_INTERVAL = 20; // ms
var MIN_MOUSE_TRACKER_DISTANCE = 20; // px
var MIN_EYE_TRACKER_INTERVAL = 20;

var lastTimeStamp_eyeTracking = START_TIME;
var lastTimeStamp_mouseMove = START_TIME;
