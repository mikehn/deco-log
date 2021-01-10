# deco-log

A clean and simple way to log javascript functions using ES6 decorators
We believe logging should be quick, easy, with no hassle
so almost all log function are only 4 letters long with built in defaults

#### installation:
simply copy the file and import it. works both client and server side.

#### usage:
some examples below, see example.js file for a more detailed overview
```javascript
//Basic of all logs - simple log
import {slog} from "./MLogger";
slog("Hello log")
```
```javascript
//info log
import {ilog} from "./MLogger";
ilog("Hello log")```
```
```javascript
//info log
import {setLogLevel,LOG_LEVEL} from "./MLogger";
setLogLevel(LOG_LEVEL.WARN)
ilog("this will not be logged")
```
```javascript
//info log
import {flog} from "./MLogger";

class A {
    //Logger decorator - will print function name,input and output, and group it for you.
	@flog
	foo(a,b){
		return a+b
	}
}
```


| Function       |Description                          
|----------------|-------------------------------
|slog|simple log (no labels)           
|ilog          |info log 
|dlog          |debug log 
|hlog          |Highlight log - highlights output
|wlog          |warning log - console.warn  
|elog          |error log  - console.err (stderr)
|mlog          |master log - can set custom options labels
