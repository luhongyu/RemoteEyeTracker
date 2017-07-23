/**
 * Created by luhongyu on 2017/7/5.
 */

/**
 * 提供接口（供popup页面调用），开始／停止，重放
 *
 * 调用 c_player.js, c_tracker.js
 */

// main function

if (RECORD_KEY === "true") {
    console.log("Logging Initializing!");

    // -------------- init WebGazer ------------ //
    if (CALIBRATION){
        initCalibrate();
        beginCalibrate();
    }else{
        initWebGazer();
        setVideo(320, 240, "0px", "0px", true);
    }

    // -------------- init LogRecord ----------- //
    initLog();
}

playInit();
