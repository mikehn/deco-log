let { dlog, hlog, elog, slog, ilog, mlog, flog,setLogLevel,LOG_LEVEL } = require("./MLogger");

const TEXT_VAR = "I am string";

/**
 * slog - Simple log, no labels, no hassle just writes stuff to screen
 */
slog("Hello log")
slog("slog Example", TEXT_VAR, 22, { cool: "logger" });

/**
 * ilog - Info log, for standard logging,
 *  */
ilog("ilog Example", TEXT_VAR, 22, { cool: "logger" });
ilog({ cool: "i logger" });

/**
 * dlog - debugger log should be used for general purpose debug
 * any logs that are verbose or are mostly used by one person should be here.
 */
dlog("dlog Example", TEXT_VAR, 22, { cool: "logger" });
dlog({ cool: "d logger" });
/**
 * hlog - highlight logger also should be used for general purpose debug 
 * adds strong marker for locating quick
 */
hlog("hlog Example", TEXT_VAR, 88, { cool: "logger" });
hlog({ cool: "h logger" });

/**
 * wlog - warning log (on node alias to error, on client writes warning)
 */
wlog("elog Example", TEXT_VAR, 18, { cool: "logger" });
wlog({ cool: "e logger" });


/**
 * elog - error log (writes to stderr)
 */
elog("elog Example", TEXT_VAR, 18, { cool: "logger" });
elog({ cool: "e logger" });


/**
 * mlog - master log, unleash the full power of logs. provide own options and labels
 */
let options = { labels: ["A", "B"], printStack: true, groupLog: true, defaultCollapsed: false };
mlog(options, "full options");
mlog(["L1", "L2"], "labels only");

class Test {
    // use @flog decorator once decorators enabled
    // decorators can only decorate class props and classes
    //@flog
    foo(a, b) {
        return a + b;
    }
}

hlog("Set log level to LOG_LEVEL.TRACE")
setLogLevel(LOG_LEVEL.TRACE);
ilog("ilog");
slog("slog");
dlog("dlog");
wlog("wlog");
elog("elog");
setLogLevel(LOG_LEVEL.ALL);
hlog("Set log level to LOG_LEVEL.INFO")
setLogLevel(LOG_LEVEL.INFO);
ilog("ilog");
slog("slog");
dlog("dlog");
wlog("wlog");
elog("elog2");
setLogLevel(LOG_LEVEL.ALL);
hlog("2Set log level to LOG_LEVEL.WARN")
setLogLevel(LOG_LEVEL.WARN);
ilog("ilog");
slog("slog");
dlog("dlog");
wlog("wlog");
elog("elog");


