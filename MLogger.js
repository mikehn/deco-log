/**
 * Create by Michael Hasin
 */
const DEFINE_GLOBALS = true;
const LABELS = {
    NONE: "NONE",    //special: will print no labels
    ALL: "ALL",      //special: will print all labels
    WARN: "WARN",    // special: will console.warn the message
    ERROR: "ERROR",  // special: will console.error the message
    PARAMS: "PARAMS", // marks method params
    RETURN: "RETURN", // marks method return value
    ENTER: "ENTER", // marks method enter
    DEBUG: "DEBUG",  // debug label
    HIGHLIGHT: "HIGHLIGHT", // special: will highlight the text (surround with '===' )
}

let enabledLogLabels = [LABELS.ALL];
let forbiddenLabels = [];
let defaultOptions = { labels: [], printStack: true, groupLog: true, defaultCollapsed: false };


/**
 * Decorator for function logging receives logging options.
 * @param {String|Array|Object} options can be single label array of labels or option object
 */
function flogOp(options) {
    //if string or array then is only labels part of option
    // in this case complete with default option.
    if (options instanceof String || Array.isArray(options)) {
        options = op(options);
    }
    return function decorator(target, name, descriptor) {
        return logFunc(target, name, descriptor, options);
    }
}

/**
 * Default decorator for function logging
 * @param {Object} options options for logging
 */
function flog(target, name, descriptor, options = op([LABELS.DEBUG])) {
    if (!descriptor) return descriptor;
    let { labels } = options;
    if (!Array.isArray(labels))
        labels = [labels];
    let key = descriptor.value ? "value" : (descriptor.get ? "get" : "initializer");
   
    let original = descriptor[key];
   
    let paramNames = getParamNames(original);
   

    descriptor[key] = function wrapper(...args) {
        if (!isLogDisabled(labels) && defaultOptions.groupLog) {
            if (options.defaultCollapsed)
                console.groupCollapsed(name);
            else
                console.group(name);
        }
        let fileName = target["constructor"] ? `${target["constructor"].name}:` : "";
        log(options, `<${fileName}${name}>`);
        logParams(options, name, paramNames, args);
        const result = original.call(this, ...args);
        log(addLabelOp([LABELS.RETURN], options), `<${name}> method returns`, result);
        if (!isLogDisabled(labels) && options.groupLog) {
            console.groupEnd();
        }
        return result;
    };
    return descriptor;
}

/**
 * Sets the labels that will be printed log will only log labels that are present in list
 * some special labels override all others, 
 * i.e:
 * NONE - will print no labels regardless of list (More powerfull then ALL)
 * ALL  - will print all labels regardless of list (does not override NONE)
 * @param  {...any} labels list of labels to set in log labels.
 */
function setLogLabels(...labels) {
    enabledLogLabels = [...labels];
}

/**
 * Sets labels in ignore list, any label in ignore list will not be logged.
 * @param  {...any} lables list of labels to ignore
 */
function setIgnoreLabels(...lables) {
    forbiddenLabels = [...labels];
}

/**
 * General logging function.
 * @param {String|Array|Object} options  can be single label array of labels or option object
 * @param  {...String} msg message to be logged
 */
let mlog = (options, ...msg) => {
    if (options instanceof String || Array.isArray(options)) {
        options = op(options);
    }
    log(options, ...msg);
}

/**
 * General logging function with automatic debug label attached.
 * @param {String|Array|Object} options  can be single label array of labels or option object
 * @param  {...String} msg message to be logged
 */
let mdlog = (options, ...msg) => {
    if (options instanceof String || Array.isArray(options)) {
        options = op(options);
    }
    log(addLabelOp([LABELS.DEBUG], options), ...msg);
};

/**
 * log messages with DEBUG label
 * @param  {...String} msg message to be logged
 */
let dlog = (...msg) => log(op([LABELS.DEBUG]), ...msg);
/**
 * log messages with HIGHLIGHT label
 * @param  {...String} msg message to be logged
 */
let hlog = (...msg) => log(op([LABELS.DEBUG, LABELS.HIGHLIGHT]), ...msg);
/**
 * log messages with ERROR label
 * @param  {...String} msg message to be logged
 */
let elog = (...msg) => log(op([LABELS.DEBUG, LABELS.HIGHLIGHT]), ...msg);
/**
 * log messages with WARNING label
 * @param  {...String} msg message to be logged
 */
let wlog = (...msg) => log(op([LABELS.WARN]), ...msg);


/**
 * Private methods (non exported) 
 */


/**
 * Gets function parameter names.
 * @param {Function} func function object to get parameter names from
 */
function getParamNames(func) {
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    const ARGUMENT_NAMES = /([^\s,]+)/g;
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

/**
 * Adds labels to and options object and returns a new object with merged label list
 * @param {String|Array} labels labels to add 
 * @param {Object} options option project to be merged with
 * @returns  a new object with merged label list
 */
function addLabelOp(labels, options) {
    if (!Array.isArray(labels))
        labels = [labels];
    let newOp = Object.assign({}, options);
    newOp.labels = [...options.labels, ...labels];
    return newOp;
}

/**
 * Options constructor
 * @param {String|Array} labels labels to tag message with
 * @param {Boolean} printStack if true will print the file location of the current log message
 * @param {Boolean} groupLog group the logs by functions (this only applies function decorators)
 * @param {Boolean} defaultCollapsed if true will be collapsed by default. 
 */
function op(
    labels = defaultOptions.labels,
    printStack = defaultOptions.printStack,
    groupLog = defaultOptions.groupLog,
    defaultCollapsed = defaultOptions.defaultCollapsed) {
    if (!Array.isArray(labels))
        labels = [labels];
    return { labels, printStack, groupLog, defaultCollapsed };
}

/**
 * logs the function parameters with corresponding values.
 * @param {Object} options log options
 * @param {String} fname name of function
 * @param {String} names function parameters names
 * @param {Array} values values of parameters
 */
function logParams(options, fname, names, values) {
    if (values && values.length > names.length) {
        log(op(LABELS.WARN, false), `could not log ${fname} values dont fit params values:[${values}]`);
    }
    let res = {};
    values.forEach((val, i) => {
        res[names[i]] = val[i];
    });
    log(addLabelOp([LABELS.PARAMS], options), res);
}

/**
 * returns logger method to be used based on given labels
 * @param {Array} labels log labels
 * @returns logger method to be used based on given labels
 */
function getLogFunc(labels) {
    if (labels.includes(LABELS.ERROR))
        return console.error;
    if (labels.includes(LABELS.WARN))
        return console.warn;
    return console.log;
}

const parenReduce = (accumulator, currentValue) => accumulator + "[" + currentValue + "]";

/**
 * TODO: Check for browser compatibility
 * Parse stack trace and extract the callee line (might only work on chrome)
 * @param {String}} stack stack trace string 
 * @returns the callee function line
 */
function parseStackTrace(stack) {
    const CALLEE_IDX = 3;
    stack = stack.split("\n");
    if (stack.length < CALLEE_IDX)
        return "N/A";
    let linkIndex = stack[CALLEE_IDX].indexOf("(");
    if (linkIndex < 0)
        return "N/A";
    return stack[CALLEE_IDX].substring(linkIndex);

}

/**
 * 
 * @param {*} labels 
 * @returns true
 */
function isLogDisabled(labels) {
    return enabledLogLabels.includes(LABELS.NONE) || forbiddenLabels.some(eLab => labels.includes(eLab));
}

function log(options, ...msg) {
    let { labels, printStack } = options;
    if (!Array.isArray(labels))
        labels = [labels];
    if (isLogDisabled(labels)) {
        return;
    }


    let logFunc = getLogFunc(labels);
    if (labels.includes(LABELS.HIGHLIGHT)) {
        logFunc("===================================");
    }
    if (enabledLogLabels.includes(LABELS.ALL) || enabledLogLabels.some(eLab => labels.includes(eLab))) {
        
        if (printStack) {
            let stack = (new Error()).stack;
            msg.push(parseStackTrace(stack));
            //logFunc(parseStackTrace(stack));
        }
        logFunc(labels.reduce(parenReduce, ""), ...msg);
    }
    
    if (labels.includes(LABELS.HIGHLIGHT)) {
        logFunc("===================================");
    }
}

function defineGlobals() {
    global.mlog = mlog;
    global.mdlog = mdlog;
    global.dlog = dlog;
    global.hlog = hlog;
    global.elog = elog;
    global.wlog = wlog;
    global.flog = flog;
    global.LLAB = LABELS;
}

//// Globals define
if (DEFINE_GLOBALS) {
    defineGlobals();
}

export { LABELS, setLogLabels, setIgnoreLabels, flog, flogOp, mlog, mdlog, dlog, hlog, elog, wlog };
