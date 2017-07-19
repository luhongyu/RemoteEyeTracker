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
 * PAGE_INIT
 */

RECORD_KEY = localStorage.getItem("GLOBAL_KEY");
console.log("RECORD_KEY: " + RECORD_KEY);

if (RECORD_KEY === "true") {
    console.log("Logging Initializing!");
    calibrate();
    log_init();
    beginRecording();
}
playInit();
/**
 * Operation Functions
 */
function replay(loglist) {
    playSequence(loglist);
}

function cam_calibrate() {
    webgazer.setRegression('ridge') /* currently must set regression and tracker */
        .setTracker('clmtrackr')
        .setGazeListener(function (data, clock) {
            //
        })
        .begin()
        .showPredictionPoints(false);

    var width = 320;
    var height = 240;
    var topDist = '0px';
    var leftDist = '0px';

    var setup = function () {
        var video = document.getElementById('webgazerVideoFeed');
        video.style.zIndex = 199;
        video.style.display = 'block';
        video.style.position = 'absolute';
        video.style.top = topDist;
        video.style.left = leftDist;
        video.width = width;
        video.height = height;
        video.style.margin = '0px';

        webgazer.params.imgWidth = width;
        webgazer.params.imgHeight = height;

        var overlay = document.getElementById('overlay');
        //overlay.id = 'overlay';
        overlay.style.zIndex = 200;
        overlay.style.position = 'absolute';
        overlay.width = width;
        overlay.height = height;
        overlay.style.top = topDist;
        overlay.style.left = leftDist;
        overlay.style.margin = '0px';

        document.body.appendChild(overlay);

        var cl = webgazer.getTracker().clm;

        function drawLoop() {
            requestAnimFrame(drawLoop);
            overlay.getContext('2d').clearRect(0, 0, width, height);
            if (cl.getCurrentPosition()) {
                cl.draw(overlay);
            }
        }

        drawLoop();
    };

    function checkIfReady() {
        if (webgazer.isReady()) {
            setup();
        } else {
            setTimeout(checkIfReady, 100);
        }
    }

    setTimeout(checkIfReady, 100);

    window.onbeforeunload = function () {
        webgazer.end();
    };

    var canvas = document.getElementById('myCanvas');
        var context = canvas.getContext('2d');
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

        var stroking = function (strokestyle) {
            context.strokeStyle = strokestyle;

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
        $('#myCanvas').click(function (e) {
            var clickedX = e.pageX - this.offsetLeft;
            var clickedY = e.pageY - this.offsetTop;

            if (clickedX < circles[2].right && clickedX > circles[2].left && clickedY > circles[2].top && clickedY < circles[2].bottom) {
                if (j < calibrationPoints.length) {
                    var x = calibrationPoints[j][0];
                    var y = calibrationPoints[j][1];
                    context.clearRect(0, 0, canvas.width, canvas.height);
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
                    var mymessage=confirm("已完成眼动模块的校准!\n接下来将进行实验的主体部分。");
                    if(mymessage==true)
                    {
                        reg.submit()

                    }
                }
            }
        });

        function goToPage(page) {
            location.href = page + ".htm";
        }

        $('#myCanvas').mousemove(function (e) {
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
                context.clearRect(0, 0, canvas.width, canvas.height);
                circles.pop();
                circles.pop();
                circles.pop();
                drawCircle(context, x, y, "black", 17, 2, style1, circles);
                drawCircle(context, x, y, "black", 10, 2, style2, circles);
                drawCircle(context, x, y, "yellow", 3, 2, style3, circles);
            }

        });
}


function calibrate() {
    $("body").append('<div id="popWindow" class="popWindow" style="display: none;"> </div><canvas id="overlay" style="display: none;"></canvas><canvas id="myCanvas" style="display: none;position: absolute; top: 0;left: 0;z-index: 201"></canvas>');
    var popwin = $("#popWindow");
    $("header").hide();

    popwin.css("background-color", "rgb(255, 255, 255)");
    popwin.css("width", "100%");
    popwin.css("min-height", document.body.offsetHeight);
    popwin.css("left", "0");
    popwin.css("top", "0");
    popwin.css("filter", "alpha(opacity=50)");
    popwin.css("opacity", "1.0");
    popwin.css("z-index", "100");
    popwin.css("position", "absolute");

    // var mask = $("#maskLayer");
    // mask.css("background-color", "#000");
    // mask.css("width", "200px");
    // mask.css("height", "30px");
    // mask.css("left", "50%");
    // mask.css("top", "50%");
    // mask.css("color", "#fff");
    // mask.css("z-index", "101");
    // mask.css("position", "absolute");
    showDiv();
    cam_calibrate();
}

function showDiv() {
    document.getElementById('popWindow').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('myCanvas').style.display = 'block';
}
function closeDiv() {
    document.getElementById('popWindow').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}