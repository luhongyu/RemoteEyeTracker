/**
 *
 * log_init();
 *
 *
 */
function log_init() {
    /**
     * Record mouse events:
     *   mousemove; mousedown; mouseup
     *   scroll; resize
     *   click
     */
    $("body").append('<base target="_blank"/>');
    recordEvent(null, "PAGE_BEGIN");

    $(window).mousemove(function (e) {
        recordEvent(e, "MOUSE_MOVE");
    });
    $(document).click(function (e) {
        recordEvent(e, "CLICK");
    });
    $(window).scroll(function (e) {
        recordEvent(e, "SCROLL");
    });

    var isTargetWindow = true;
    $(window).focus(function() {
        isTargetWindow = true;
        recordEvent(null, "JUMP_IN");
    });
    $(window).blur(function() {
        if(isTargetWindow){
           recordEvent(null, "JUMP_OUT");
           isTargetWindow = false;
        }
    });
    window.onbeforeunload = function () {
        recordEvent(null, "PAGE_END");
        endRecording();
    };
}

function recordEvent(e, type) {
    /**
     * EVENTS: [ SCROLL; MOUSE_MOVE; CLICK; JUMP_IN; JUMP_OUT; PAGE_END; PAGE_BEGIN ]
     */
    if (RECORD_KEY){
        if (type === "SCROLL"){
            events.push({
                time: e.timeStamp - START_TIME,
                type: "SCROLL",
                x: $(window).scrollLeft(),
                y: $(window).scrollTop()
            });
        }
        else if(type === "MOUSE_MOVE"){
            let mouse = getMousePos(e);
            events.push({
                time: e.timeStamp - START_TIME,
                type: type,
                x: mouse.x,
                y: mouse.y
            });
        }
        else if(type === "CLICK"){
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
        else if(type === "JUMP_IN" || type === "JUMP_OUT" || type === "PAGE_END" || type === "PAGE_BEGIN"){
            events.push({
                time: new Date() - START_TIME,
                type: type
            })
        }
    }
}

/**
 * Utils
 */
function beginRecording() {
    NOW_RECORD = buildLogName();
    console.log(NOW_RECORD + "\t Begin logging!");

    chrome.extension.sendMessage({
        key: "PAGE_LOG_BEGIN"
    });

    //reset
    events = [];
}
function endRecording() {
    /**
     * only when page close
     */
    RECORD_KEY = false;
    PAGE_RECORDS[NOW_RECORD] = events;

    chrome.extension.sendMessage({
        key: "PAGE_LOG_END",
        log_name: NOW_RECORD,
        log_data: events
    });

    console.log(NOW_RECORD + "\t End logging!");
    console.log(events);

    //reset
    events = [];
}


