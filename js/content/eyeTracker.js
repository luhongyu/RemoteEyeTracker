/**
 * Created by luhongyu on 2017/7/12.
 */

window.onload = function () {
    webgazer.setRegression('ridge')
        .setTracker('clmtrackr')
        .setGazeListener(function (data, clock) {
            if (data) {
                // 转换 屏幕位置(data.x, data.y) 到 页面位置 (px, py)
                data = bound(data);
                var px = data.x + $(window).scrollLeft();
                var py = data.y + $(window).scrollTop();
                console.log(data);
                gaze_list.push({"px": px, "py": py, "time": parseInt(clock)});
            }
        })
        .begin()
        .showPredictionPoints(true);

    var width = 320;
    var height = 240;
    var topDist = '0px';
    var leftDist = '0px';
    var setup = function () {
        var video = document.getElementById('webgazerVideoFeed');
        video.style.display = 'hidden';
        video.style.position = 'absolute';
        video.style.top = topDist;
        video.style.left = leftDist;
        video.width = width;
        video.height = height;
        video.style.margin = '0px';

        webgazer.params.imgWidth = width;
        webgazer.params.imgHeight = height;
    };

    function checkIfReady() {
        if (webgazer.isReady()) {
            setup();
        } else {
            setTimeout(checkIfReady, 100);
        }
    }

    setTimeout(checkIfReady, 100);
};

window.onbeforeunload = function () {
    webgazer.end();
};

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