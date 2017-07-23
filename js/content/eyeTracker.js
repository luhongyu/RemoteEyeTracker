/**
 * Created by luhongyu on 2017/7/21.
 */

function beginCalibrate() {
    $("body").append('<canvas id="calCanvas" style="display: block;position: absolute; top: 0;left: 0;"></canvas>');

    var canvas = $("#calCanvas");
    canvas.css("z-index", INDEX_CAL);

    var context = canvas.get(0).getContext('2d');
    var circles = [];
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
    var w = window.innerWidth;
    var h = window.innerHeight;

    var draw = function (context, x, y, fillcolor, radius, linewidth, strokestyle) {
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.fillStyle = fillcolor;
        context.fill();
        context.lineWidth = linewidth;
        context.strokeStyle = strokestyle;
        context.stroke();
    };

    var Circle = function (x, y, radius) {
        this.left = x - radius;
        this.top = y - radius;
        this.right = x + radius;
        this.bottom = y + radius;
    };

    var drawCircle = function (context, x, y, fillcolor, radius, linewidth, strokestyle, circles) {
        draw(context, x, y, fillcolor, radius, linewidth, strokestyle);
        var circle = new Circle(x, y, radius);
        circles.push(circle);
    };

    var calibrationPoints = [[40, 40], [w / 2, 40], [w - 40, 40], [40, h / 2], [w / 2, h / 2], [w - 40, h / 2], [40, h - 40], [w / 2, h - 40], [w - 40, h - 40]];
    // var calibrationPoints = [[40, 40]];

    var x = calibrationPoints[0][0];
    var y = calibrationPoints[0][1];

    drawCircle(context, x, y, "black", 17, 2, "black", circles);
    drawCircle(context, x, y, "black", 10, 2, "black", circles);
    drawCircle(context, x, y, "yellow", 3, 2, "black", circles);

    var j = 1;
    var k = 0;
    canvas.click(function (e) {
        var clickedX = e.pageX - this.offsetLeft;
        var clickedY = e.pageY - this.offsetTop;

        if (clickedX < circles[2].right && clickedX > circles[2].left && clickedY > circles[2].top && clickedY < circles[2].bottom) {
            if (j < calibrationPoints.length) {
                var x = calibrationPoints[j][0];
                var y = calibrationPoints[j][1];
                context.clearRect(0, 0, canvas.get(0).width, canvas.get(0).height);
                circles.pop();
                circles.pop();
                circles.pop();
                drawCircle(context, x, y, "black", 17, 2, "black", circles);
                drawCircle(context, x, y, "black", 10, 2, "black", circles);
                drawCircle(context, x, y, "yellow", 3, 2, "black", circles);
                j++;
                k++;
            }
            else {
                // TODO: turn to log
                endCalibrate();
            }
        }
    });

    canvas.mousemove(function (e) {
        var clickedX = e.pageX - this.offsetLeft;
        var clickedY = e.pageY - this.offsetTop;
        var style1 = "black";
        var style2 = "black";
        var style3 = "black";

        if (k < calibrationPoints.length) {
            if (clickedX < circles[0].right && clickedX > circles[0].left && clickedY > circles[0].top && clickedY < circles[0].bottom) {
                style1 = "red";
            }
            else {
                style1 = "black"
            }
            if (clickedX < circles[1].right && clickedX > circles[1].left && clickedY > circles[1].top && clickedY < circles[1].bottom) {
                style2 = "orange"
            }
            else {
                style2 = "black"
            }
            if (clickedX < circles[2].right && clickedX > circles[2].left && clickedY > circles[2].top && clickedY < circles[2].bottom) {
                style3 = "green"
            }
            else {
                style3 = "black"
            }
            var x = calibrationPoints[k][0];
            var y = calibrationPoints[k][1];
            context.clearRect(0, 0, canvas.get(0).width, canvas.get(0).height);
            circles.pop();
            circles.pop();
            circles.pop();
            drawCircle(context, x, y, "black", 17, 2, style1, circles);
            drawCircle(context, x, y, "black", 10, 2, style2, circles);
            drawCircle(context, x, y, "yellow", 3, 2, style3, circles);
        }

    });
}

function initCalibrate() {
    // ---------- init Mask ---------------- //
    $("body").append('<div id="maskLayer" class="popWindow"></div>');
    var maskLayer = $("#maskLayer");
    // $("header").hide();

    var maskHeight = $("body").height();
    maskLayer.css("display", "block");
    maskLayer.css("background-color", "rgb(255, 255, 255)");
    maskLayer.css("width", "100%");
    maskLayer.css("min-height", maskHeight);
    maskLayer.css("left", "0");
    maskLayer.css("top", "0");
    maskLayer.css("filter", "alpha(opacity=50)");
    maskLayer.css("opacity", "1.0");
    maskLayer.css("zIndex", INDEX_MASK);
    maskLayer.css("position", "absolute");

    // ---------- init WebGazer ----------- //
    initWebGazer();

    // ---------- init Camera ------------- //
    var width = 320, height = 240, topDist = "0px", leftDist = "0px";

    setVideo(width, height, topDist, leftDist, false);
    drawClm(width, height, topDist, leftDist, false);

    // ---------- begin Calibrate --------- //
}
function endCalibrate() {
    // ---------- end Camera --------------- //
    CLM_KEY = false;
    CALIBRATION = false;

    var video = $('#webgazerVideoFeed');
    video.css("display", "none");
    video.css("z-index", 0);

    // ---------- end Mask ----------------- //
    var maskLayer = $("#maskLayer");
    maskLayer.css("zIndex", 0);
    maskLayer.css("display", "none");
    // $("header").show();

    var canvas = $("#calCanvas");
    canvas.css("display", "none");

    var overlay = $("#overlay");
    overlay.css("z-index", 0);
    overlay.css("display", "none");

    webgazer.showPredictionPoints(true);
    beginRecording();
}

function initWebGazer() {
    webgazer.setRegression('ridge')
        .setTracker('clmtrackr')
        .setGazeListener(function (data, nowTimeStamp) {
            if (data && !CALIBRATION) {
                data = bound(data);
                var px = data.x + $(window).scrollLeft();
                var py = data.y + $(window).scrollTop();

                if (nowTimeStamp - lastTimeStamp_eyeTracking > MIN_EYE_TRACKER_INTERVAL){
                    lastTimeStamp_eyeTracking = nowTimeStamp;
                    gaze_list.push({
                        x: px,
                        y: py,
                        time: nowTimeStamp - START_TIME,
                        type: "EYE_MOVE"
                    });
                }
            }
        })
        .begin()
        .showPredictionPoints(true);
}

function setVideo(width, height, topDist, leftDist, hidden) {
    var setup = function () {
        var video = document.getElementById('webgazerVideoFeed');
        video.style.display = hidden ? 'none' : "block" ; // show or not
        video.style.zIndex = hidden ? 0 : INDEX_VIDEO; // z-index
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
            setup(); // act only once;
        } else {
            setTimeout(checkIfReady, 100);
        }
    }
    setTimeout(checkIfReady, 100);
}
function drawClm(width, height, topDist, leftDist, hidden) {
    if (hidden){ return; }

    var overlay = document.createElement('canvas');
    overlay.id = 'overlay';
    overlay.style.position = 'absolute';
    overlay.width = width;
    overlay.height = height;
    overlay.style.top = topDist;
    overlay.style.left = leftDist;
    overlay.style.margin = '0px';
    overlay.style.zIndex = INDEX_CLM;

    document.body.appendChild(overlay);

    var cl = webgazer.getTracker().clm;

    function drawLoop() {
        var drawid = requestAnimFrame(drawLoop);
        if (!CLM_KEY){
            cancelRequestAnimFrame(drawid);
        }
        overlay.getContext('2d').clearRect(0, 0, width, height);
        if (cl.getCurrentPosition()) {
            cl.draw(overlay);
            // TODO: catched face => log
        }
    }
    drawLoop();
}
