/**
 * Create by Michael Hasin
 */

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

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

function getParametersNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

function setLogLabels(...labels) {
    enabledLogLabels = [...labels];
}

function setIgnoreLabels(...lables) {
    forbiddenLabels = [...labels];
}

function logParams(labels, fname, names, values) {
    if (values && values.length > names.length) {
        log(LABELS.WARN, `could not log ${fname} values dont fit params values:[${values}]`);
    }
    let res = {};
    values.forEach((val, i) => {
        res[names[i]] = val[i];
    });
    log([...labels, LABELS.PARAMS], res);
}

function loggerLabel(labels) {
    return function decorator(target, name, descriptor) {
        return logger(target, name, descriptor, labels);
    }
}


function logger(target, name, descriptor, labels = [LABELS.DEBUG]) {
    if (!descriptor) return descriptor;
    if (!Array.isArray(labels))
        labels = [labels];
    let key = descriptor.value ? "value" : "get";
    let original = descriptor[key];
    let paramNames = getParametersNames(original);
    descriptor[key] = function wrapper(...args) {
        let fileName = target["constructor"] ? `${target["constructor"].name}:` : "";
        log(labels, `<${fileName}${name}>`);
        logParams(labels, name, paramNames, args);
        const result = original.call(this, ...args);
        log([...labels, LABELS.RETURN], `<${name}> method returns`, result);
        return result;
    };
    return descriptor;
}

function getLogFunc(labels) {
    if (labels.includes(LABELS.ERROR))
        return console.error;
    if (labels.includes(LABELS.WARN))
        return console.warn;
    return console.log;
}

const parenReduce = (accumulator, currentValue) => accumulator + "[" + currentValue + "]";

function log(labels, ...msg) {
    if (!Array.isArray(labels))
        labels = [labels];
    if (enabledLogLabels.includes(LABELS.NONE) || forbiddenLabels.some(eLab => labels.includes(eLab))) {
        return;
    }
    if (labels.includes(LABELS.HIGHLIGHT)) {
        console.log("===================================");
    }
    if (enabledLogLabels.includes(LABELS.ALL) || enabledLogLabels.some(eLab => labels.includes(eLab))) {
        let logFunc = getLogFunc(labels);
        logFunc(labels.reduce(parenReduce, ""), ...msg);
    }
    if (labels.includes(LABELS.HIGHLIGHT)) {
        console.log("===================================");
    }
}

global.mlog = log;
global.mdlog = (labels, ...msg) => log([...labels, LABELS.DEBUG], ...msg);
global.dlog = (...msg) => log([LABELS.DEBUG], ...msg);
global.hlog = (...msg) => log([LABELS.DEBUG, LABELS.HIGHLIGHT], ...msg);
global.elog = (...msg) => log([LABELS.ERROR], ...msg);
global.wlog = (...msg) => log([LABELS.WARN], ...msg);
global.LABELS = LABELS;

export { LABELS, logger, setLogLabels, setIgnoreLabels, loggerLabel };