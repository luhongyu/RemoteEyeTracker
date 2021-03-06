/**
 * 在当前页面上，按照记录的鼠标位置，移动鼠标图像
 *
 *
 */

var cursor;
var point;
var body = $("html, body");
// var PLAY_RECORD;

let step = null;
let prevstep = null;


function playInit() {
    var cursorimg = chrome.extension.getURL("sources/cursor.gif");
    $('body').append("<img class=\"cursor\" src=\"sources/cursor.gif\" style=\"position:absolute;\" />");
    cursor = $('body .cursor');
    cursor.attr("src", cursorimg);
    cursor.css("z-index", INDEX_CURSOR);

    var pointimg = chrome.extension.getURL("sources/point.png");
    $('body').append("<img class=\"point\" src=\"sources/point.png\" style=\"position:absolute;\" />");
    point = $('body .point');
    point.attr("src", pointimg);
    point.css("z-index", INDEX_CURSOR);
}

//TODO: add set function
function playSequence(loglist) {
    cursor.clearQueue();

    //TODO: set by background
    let sequence = loglist.slice();

    body.scrollTop(0);
    body.scrollLeft(0);

    cursor.css({
        top: sequence[0].y,
        left: sequence[0].x
    });

    playStep(sequence);
}

function playStep(sequence) {
    step = sequence.shift();
    // console.log(step);

    if (step.type === 'MOUSE_MOVE') {
        if (!prevstep){
            prevstep = step;
            playStep(sequence);
        }else {
            cursor.animate({
                    top: step.y,
                    left: step.x
                }, step.time - prevstep.time,
                'linear',
                function () {
                    nextStep(step, sequence);
                }
            );
        }
    }
    else if (step.type === 'EYE_MOVE') {
        if (!prevstep){
            prevstep = step;
            playStep(sequence);
        }else {
            point.animate({
                    top: step.y,
                    left: step.x
                }, step.time - prevstep.time,
                'linear',
                function () {
                    nextStep(step, sequence);
                }
            );
        }
    }
    // else if (step.type === 'click') {
    //     cursor.css({background: "#ff0000"});
    //     nextStep(step, sequence);
    // } else if (step.type === 'scroll') {
    //     cursor.animate({}, 0, 'linear', function () {
    //         body.animate(
    //             {scrollTop: step.y, scrollLeft: step.x,},
    //             step.time - prevstep.time,
    //             'linear',
    //             function () {
    //                 nextStep(step, sequence);
    //             }
    //         );
    //     });
    // } else if (step.type === 'mousedown') {
    //     cursor.addClass('mousedown');
    //     cursor.delay(step.time - prevstep.time);
    //     nextStep(step, sequence);
    // } else if (step.type === 'mouseup') {
    //     cursor.removeClass('mousedown');
    //     cursor.delay(step.time - prevstep.time);
    //     nextStep(step, sequence);
    // }
    else {
        if (sequence.length > 0) {
            playStep(sequence);
        }
    }
}

function nextStep(current, sequence) {
    prevstep = current;
    // console.log(prevstep);
    if (sequence.length > 0) {
        playStep(sequence);
    }
}

function replay(loglist) {
    playSequence(loglist)
}