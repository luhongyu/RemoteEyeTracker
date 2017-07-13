/**
 * 监听页面鼠标移动
 *
 * 外部数据：$.records {log_name: log_sequence}
 *
 * 外部接口
 * $.endRecords()
 * $.beginRecords()
 */

$(function () {
    /**
     * Record mouse events:
     *   mousemove; mousedown; mouseup
     *   scroll; resize
     *   click
     */
    $(window).mousemove(function (e) {
        recordMouseEvent(e, "MOUSE_MOVE");
    });
    $(document).click(function (e) {
        recordClickEvent(e, "CLICK");
    });
    $(window).scroll(function (e) {
        events.push({
            time: e.timeStamp - START_TIME,
            type: "SCROLL",
            x: $(window).scrollLeft(),
            y: $(window).scrollTop()
        });
    });

    var isTargetWindow = true;
    $(window).focus(function() {
        isTargetWindow = true;
        recordPageEvent("JUMP_IN");
    });

    $(window).blur(function() {
        if(isTargetWindow){
           recordPageEvent("JUMP_OUT");
           isTargetWindow = false;
        }
    });

    window.onbeforeunload = function () {
        recordPageEvent("PAGE_END");
        endRecording();
    };
});

function recordMouseEvent(e, type) {
    if (RECORD_KEY) {
        let mouse = getMousePos(e);
        events.push({
            time: e.timeStamp - START_TIME,
            type: type,
            x: mouse.x,
            y: mouse.y
        });
    }
}
function recordClickEvent(e, type) {
    if (RECORD_KEY){
        let mouse = getMousePos(e);
        let target = $(e.target).get(0).tagName;
        if (target === "A" || target === "a"){
            target = $(e.target).attr("href");
        }else{
            target = $(e.target).attr('class') || $(e.target).attr('id') || $(e.target).get(0).tagName;
        }
        events.push({
            time: e.timeStamp - START_TIME,
            type: type,
            x: mouse.x,
            y: mouse.y,
            target: target
        });

        console.log(events[events.length - 1]);
    }
}
function recordPageEvent(type) {
    if (RECORD_KEY){
        events.push({
            time: new Date() - START_TIME,
            type: type
        })
    }
}

// utils
function reset() {
    events = [];
}
function buildname() {
    return getNowFormatDate();
}
function getMousePos(ev) {
    //alert("get mouse");
    var e = ev || window.event;
    var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
    var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    var clientLeft = document.body.clientLeft;
    var clientTop = document.body.clientTop;
    var x = e.pageX || e.clientX + scrollX - clientLeft;
    var y = e.pageY || e.clientY + scrollY - clientTop;
    return { 'x': x, 'y': y };
}

function beginRecording() {
    if (!RECORD_KEY) {
        RECORD_KEY = true;
        NOW_RECORD = buildname();
        console.log(NOW_RECORD + "\t Begin logging!");

        chrome.extension.sendMessage({
            key: "LOG_BEGIN"
        });
        reset();
    }
}
function endRecording() {
    if (RECORD_KEY) {
        RECORD_KEY = false;
        PAGE_RECORDS[NOW_RECORD] = events;

        chrome.extension.sendMessage({
            key: "LOG_END",
            log_name: NOW_RECORD,
            log_data: events
        });

        console.log(NOW_RECORD + "\t End logging!");
        console.log(events);

        reset();
    }
}
