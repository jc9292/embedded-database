/*
http://www.JSON.org/json2.js
2011-10-19
 
Public Domain.
 
NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 
See http://www.JSON.org/js.html
 
 
This code should be minified before deployment.
See http://javascript.crockford.com/jsmin.html
 
USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
NOT CONTROL.
 
 
This file creates a global JSON object containing two methods: stringify
and parse.
 
JSON.stringify(value, replacer, space)
value any JavaScript value, usually an object or array.
 
replacer an optional parameter that determines how object
values are stringified for objects. It can be a
function or an array of strings.
 
space an optional parameter that specifies the indentation
of nested structures. If it is omitted, the text will
be packed without extra whitespace. If it is a number,
it will specify the number of spaces to indent at each
level. If it is a string (such as '\t' or '&nbsp;'),
it contains the characters used to indent at each level.
 
This method produces a JSON text from a JavaScript value.
 
When an object value is found, if the object contains a toJSON
method, its toJSON method will be called and the result will be
stringified. A toJSON method does not serialize: it returns the
value represented by the name/value pair that should be serialized,
or undefined if nothing should be serialized. The toJSON method
will be passed the key associated with the value, and this will be
bound to the value
 
For example, this would serialize Dates as ISO strings.
 
Date.prototype.toJSON = function (key) {
function f(n) {
// Format integers to have at least two digits.
return n < 10 ? '0' + n : n;
}
 
return this.getUTCFullYear() + '-' +
f(this.getUTCMonth() + 1) + '-' +
f(this.getUTCDate()) + 'T' +
f(this.getUTCHours()) + ':' +
f(this.getUTCMinutes()) + ':' +
f(this.getUTCSeconds()) + 'Z';
};
 
You can provide an optional replacer method. It will be passed the
key and value of each member, with this bound to the containing
object. The value that is returned from your method will be
serialized. If your method returns undefined, then the member will
be excluded from the serialization.
 
If the replacer parameter is an array of strings, then it will be
used to select the members to be serialized. It filters the results
such that only members with keys listed in the replacer array are
stringified.
 
Values that do not have JSON representations, such as undefined or
functions, will not be serialized. Such values in objects will be
dropped; in arrays they will be replaced with null. You can use
a replacer function to replace those with JSON values.
JSON.stringify(undefined) returns undefined.
 
The optional space parameter produces a stringification of the
value that is filled with line breaks and indentation to make it
easier to read.
 
If the space parameter is a non-empty string, then that string will
be used for indentation. If the space parameter is a number, then
the indentation will be that many spaces.
 
Example:
 
text = JSON.stringify(['e', {pluribus: 'unum'}]);
// text is '["e",{"pluribus":"unum"}]'
 
 
text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
// text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'
 
text = JSON.stringify([new Date()], function (key, value) {
return this[key] instanceof Date ?
'Date(' + this[key] + ')' : value;
});
// text is '["Date(---current time---)"]'
 
 
JSON.parse(text, reviver)
This method parses a JSON text to produce an object or array.
It can throw a SyntaxError exception.
 
The optional reviver parameter is a function that can filter and
transform the results. It receives each of the keys and values,
and its return value is used instead of the original value.
If it returns what it received, then the structure is not modified.
If it returns undefined then the member is deleted.
 
Example:
 
// Parse the text. Values that look like ISO date strings will
// be converted to Date objects.
 
myData = JSON.parse(text, function (key, value) {
var a;
if (typeof value === 'string') {
a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
if (a) {
return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
+a[5], +a[6]));
}
}
return value;
});
 
myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
var d;
if (typeof value === 'string' &&
value.slice(0, 5) === 'Date(' &&
value.slice(-1) === ')') {
d = new Date(value.slice(5, -1));
if (d) {
return d;
}
}
return value;
});
 
 
This is a reference implementation. You are free to copy, modify, or
redistribute.
*/
 
/*jslint evil: true, regexp: true */
 
/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
lastIndex, length, parse, prototype, push, replace, slice, stringify,
test, toJSON, toString, valueOf
*/
 
 
// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.
 
var JSON;
if (!JSON) {
JSON = {};
}
 
(function () {
'use strict';
 
function f(n) {
// Format integers to have at least two digits.
return n < 10 ? '0' + n : n;
}
 
if (typeof Date.prototype.toJSON !== 'function') {
 
Date.prototype.toJSON = function (key) {
 
return isFinite(this.valueOf())
? this.getUTCFullYear() + '-' +
f(this.getUTCMonth() + 1) + '-' +
f(this.getUTCDate()) + 'T' +
f(this.getUTCHours()) + ':' +
f(this.getUTCMinutes()) + ':' +
f(this.getUTCSeconds()) + 'Z'
: null;
};
 
String.prototype.toJSON =
Number.prototype.toJSON =
Boolean.prototype.toJSON = function (key) {
return this.valueOf();
};
}
 
var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
gap,
indent,
meta = { // table of character substitutions
'\b': '\\b',
'\t': '\\t',
'\n': '\\n',
'\f': '\\f',
'\r': '\\r',
'"' : '\\"',
'\\': '\\\\'
},
rep;
 
 
function quote(string) {
 
// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.
 
escapable.lastIndex = 0;
return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
var c = meta[a];
return typeof c === 'string'
? c
: '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
}) + '"' : '"' + string + '"';
}
 
 
function str(key, holder) {
 
// Produce a string from holder[key].
 
var i, // The loop counter.
k, // The member key.
v, // The member value.
length,
mind = gap,
partial,
value = holder[key];
 
// If the value has a toJSON method, call it to obtain a replacement value.
 
if (value && typeof value === 'object' &&
typeof value.toJSON === 'function') {
value = value.toJSON(key);
}
 
// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.
 
if (typeof rep === 'function') {
value = rep.call(holder, key, value);
}
 
// What happens next depends on the value's type.
 
switch (typeof value) {
case 'string':
return quote(value);
 
case 'number':
 
// JSON numbers must be finite. Encode non-finite numbers as null.
 
return isFinite(value) ? String(value) : 'null';
 
case 'boolean':
case 'null':
 
// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.
 
return String(value);
 
// If the type is 'object', we might be dealing with an object or an array or
// null.
 
case 'object':
 
// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.
 
if (!value) {
return 'null';
}
 
// Make an array to hold the partial results of stringifying this object value.
 
gap += indent;
partial = [];
 
// Is the value an array?
 
if (Object.prototype.toString.apply(value) === '[object Array]') {
 
// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.
 
length = value.length;
for (i = 0; i < length; i += 1) {
partial[i] = str(i, value) || 'null';
}
 
// Join all of the elements together, separated with commas, and wrap them in
// brackets.
 
v = partial.length === 0
? '[]'
: gap
? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
: '[' + partial.join(',') + ']';
gap = mind;
return v;
}
 
// If the replacer is an array, use it to select the members to be stringified.
 
if (rep && typeof rep === 'object') {
length = rep.length;
for (i = 0; i < length; i += 1) {
if (typeof rep[i] === 'string') {
k = rep[i];
v = str(k, value);
if (v) {
partial.push(quote(k) + (gap ? ': ' : ':') + v);
}
}
}
} else {
 
// Otherwise, iterate through all of the keys in the object.
 
for (k in value) {
if (Object.prototype.hasOwnProperty.call(value, k)) {
v = str(k, value);
if (v) {
partial.push(quote(k) + (gap ? ': ' : ':') + v);
}
}
}
}
 
// Join all of the member texts together, separated with commas,
// and wrap them in braces.
 
v = partial.length === 0
? '{}'
: gap
? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
: '{' + partial.join(',') + '}';
gap = mind;
return v;
}
}
 
// If the JSON object does not yet have a stringify method, give it one.
 
if (typeof JSON.stringify !== 'function') {
JSON.stringify = function (value, replacer, space) {
 
// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.
 
var i;
gap = '';
indent = '';
 
// If the space parameter is a number, make an indent string containing that
// many spaces.
 
if (typeof space === 'number') {
for (i = 0; i < space; i += 1) {
indent += ' ';
}
 
// If the space parameter is a string, it will be used as the indent string.
 
} else if (typeof space === 'string') {
indent = space;
}
 
// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.
 
rep = replacer;
if (replacer && typeof replacer !== 'function' &&
(typeof replacer !== 'object' ||
typeof replacer.length !== 'number')) {
throw new Error('JSON.stringify');
}
 
// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.
 
return str('', {'': value});
};
}
 
 
// If the JSON object does not yet have a parse method, give it one.
 
if (typeof JSON.parse !== 'function') {
JSON.parse = function (text, reviver) {
 
// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.
 
var j;
 
function walk(holder, key) {
 
// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.
 
var k, v, value = holder[key];
if (value && typeof value === 'object') {
for (k in value) {
if (Object.prototype.hasOwnProperty.call(value, k)) {
v = walk(value, k);
if (v !== undefined) {
value[k] = v;
} else {
delete value[k];
}
}
}
}
return reviver.call(holder, key, value);
}
 
 
// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.
 
text = String(text);
cx.lastIndex = 0;
if (cx.test(text)) {
text = text.replace(cx, function (a) {
return '\\u' +
('0000' + a.charCodeAt(0).toString(16)).slice(-4);
});
}
 
// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.
 
// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
 
if (/^[\],:{}\s]*$/
.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
 
// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.
try {
j = eval('(' + text + ')');
} catch(e) {
console.log("unable to parse: " + text);
}
 
// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.
 
return typeof reviver === 'function'
? walk({'': j}, '')
: j;
}
 
// If the text is not JSON parseable, then a SyntaxError is thrown.
 
throw new SyntaxError('JSON.parse');
};
}
}());
 
 
 
var Base64 = {
// private property
_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
// public method for encoding
encode : function (input) {
var output = "";
var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
var i = 0;
input = Base64._utf8_encode(input);
while (i < input.length) {
chr1 = input.charCodeAt(i++);
chr2 = input.charCodeAt(i++);
chr3 = input.charCodeAt(i++);
enc1 = chr1 >> 2;
enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
enc4 = chr3 & 63;
if (isNaN(chr2)) {
enc3 = enc4 = 64;
} else if (isNaN(chr3)) {
enc4 = 64;
}
output = output +
this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
}
return output;
},
// public method for decoding
decode : function (input) {
var output = "";
var chr1, chr2, chr3;
var enc1, enc2, enc3, enc4;
var i = 0;
input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
while (i < input.length) {
enc1 = this._keyStr.indexOf(input.charAt(i++));
enc2 = this._keyStr.indexOf(input.charAt(i++));
enc3 = this._keyStr.indexOf(input.charAt(i++));
enc4 = this._keyStr.indexOf(input.charAt(i++));
chr1 = (enc1 << 2) | (enc2 >> 4);
chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
chr3 = ((enc3 & 3) << 6) | enc4;
output = output + String.fromCharCode(chr1);
if (enc3 != 64) {
output = output + String.fromCharCode(chr2);
}
if (enc4 != 64) {
output = output + String.fromCharCode(chr3);
}
}
output = Base64._utf8_decode(output);
return output;
},
// private method for UTF-8 encoding
_utf8_encode : function (string) {
string = string.replace(/\r\n/g,"\n");
var utftext = "";
for (var n = 0; n < string.length; n++) {
var c = string.charCodeAt(n);
if (c < 128) {
utftext += String.fromCharCode(c);
}
else if((c > 127) && (c < 2048)) {
utftext += String.fromCharCode((c >> 6) | 192);
utftext += String.fromCharCode((c & 63) | 128);
}
else {
utftext += String.fromCharCode((c >> 12) | 224);
utftext += String.fromCharCode(((c >> 6) & 63) | 128);
utftext += String.fromCharCode((c & 63) | 128);
}
}
return utftext;
},
// private method for UTF-8 decoding
_utf8_decode : function (utftext) {
var string = "";
var i = 0;
var c = c1 = c2 = 0;
while ( i < utftext.length ) {
c = utftext.charCodeAt(i);
if (c < 128) {
string += String.fromCharCode(c);
i++;
}
else if((c > 191) && (c < 224)) {
c2 = utftext.charCodeAt(i+1);
string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
i += 2;
}
else {
c2 = utftext.charCodeAt(i+1);
c3 = utftext.charCodeAt(i+2);
string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
i += 3;
}
}
return string;
}
}
 
/**
* @module jembe-base
**/
try {
function JembeError(_code, _message) {
this.code = _code;
this.message = _message;
}
 
 
 
var jembe = {
num_jembe_instances: 0,
instances: [],
_execute: function(type, params) {
var instance_number = jembe.num_jembe_instances;
jembe.num_jembe_instances+=1;
eval('jembe.instances[' + instance_number +'] = new JembeInterface(instance_number, type, params)');
eval('jembe.instances[' + instance_number + ']._execute()');	
}
}
 
/**
* Use a sqlite database in jembe
*
* var db = jembe.db.openDatabase({customers});
* db.execute({sql:"select * from Client", onSuccess:showClients});
* db.close();
*
* function showClients(data) {
*
* }
*
* @class db
**/
jembe.db = {
openDbs: [],
/**
* Create an instance of {JembeDb}. <br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
*
* @method openDatabase
* @return {JembeDb} An instance of JembeDb
* @param {Object} [params]
* @param {String} params.dbName The name of the database
**/
openDatabase: function(params) {
var dbName = params.dbName;
if(!jembe.db.openDbs[dbName]) {
jembe.db.openDbs[dbName] = new JembeDb(params.dbName);
}
return jembe.db.openDbs[dbName];
},
execute: function(params) {
jembe._execute("db", params);
},
close: function(params) {
params.action = "close";
jembe._execute("db", params);
var dbName = params.dbName;
if(jembe.db.openDbs[dbName]) {
jembe.db.openDbs[dbName] = null;
}
}
};
/**
* Connector to a sqlite database
* To get an instance, you have to use {{#crossLink "Db/openDatabase"}}{{/crossLink}}
* @class JembeDb
**/
function JembeDb(dbName) {
this.dbName = dbName;
}
 
/**
* Execute a sql request
* @method execute
* @params {Object} params
* @params {String} params.sql The sql request
* @params {Function} params.onSuccess The callback to receive data
**/
JembeDb.prototype.execute = function(params) {
params.dbName = this.dbName;
jembe.db.execute(params);
};
/**
* Close the database
* @method close
**/
JembeDb.prototype.close = function() {
jembe.db.close({dbName: this.dbName});
};
 
 
/**
* Make http calls
*
* @class http
**/
jembe.http = {
/**
* Execute a GET Request. This method return either the full response as string or the name of the downloaded file.<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
*
* @method get
* @params {Object} params
* @params {String} params.url The url
* @params {String} params.output If set, the content of the response is saved to this file. You can then access it calling "/jembedocs/{output}"
* @params {String} params.useGzip If set, the downloaded file will be decompressed. Note the the file on server has to be compressed.
* @params {Object} params.headers Contains a json object {header:value, header2:value,...}
* @params {Function} params.onSuccess The callback if the request succeed
* @params {Function} params.onError The callback if the request fails
* @params {String} params.onProgress callback method name to get the progress of the operation
**/
get: function(params) {
params.method = "GET";
if(params.onProgress) {
params.sendProgress="true";
}
jembe._execute("http", params);
},
/**
* Execute a POST Request. This method return either the full response as string or the name of the downloaded file.<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
*
* @method post
* @params {Object} params
* @params {String} params.url The url
* @params {String} params.output If set, the content of the response is saved to this file. You can then access it calling "/jembedocs/{output}"
* @params {String} params.data The data to be passed on the body of the request
* @params {String} params.upload The path to the file to be upload
* @params {Object} params.headers Contains a json object {header:value, header2:value,...}
* @params {Function} params.onSuccess The callback if the request succeed
* @params {Function} params.onError The callback if the request fails
* @params {String} params.onProgress callback method name to get the progress of the operation
**/
post: function(params) {
params.method = "POST";
if(params.onProgress) {
params.sendProgress="true";
}
jembe._execute("http", params);
},
/**
* Cancel the current download. If the request is already finished, this method do nothing<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
*
* @method cancel
* @params {Object} params
* @params {String} params.url The url of the download to cancel
**/
cancel: function(params) {
params.method = "cancel";
jembe._execute("http", params);
},
/**
* Get All the current downloads. This is usefull to restart a download after the apps go to background
*
* @method getCurrentDownloads
* @params {Object} params
* @params {Function} params.onSuccess called with the current downloads
**/
getCurrentDownloads: function(params) {
params.method = "getCurrentDownloads";
jembe._execute("http", params);
}
};
/**
* Get information about the hardware
* @class info
**/
jembe.info = {
/**
* The UUID of the device. The UUID is generated once per machine.<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
* @property uuid
**/
uuid: undefined,
/**
* The hardware name (For example: GT-P7510 for the galaxy tab WIFI)<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
* @property hwName
**/
hwName: undefined,
/**
* The brand of the device (For example Samsung or Apple
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}}
* @property brand
**/
brand: undefined,
/**
* The Platform name: android | iOS | linux | macosx | windows<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
* @property platform
**/
platform: undefined,
/**
* The os version. Undefined on linux<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
* @property platformVersion
**/
platformVersion: undefined,
/**
* The jembe version<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
* @property jembeVersion
**/
jembeVersion: undefined,
/**
* The app version
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
* @property appVersion
**/
appVersion: undefined,
/**
* The model of the device
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}}
* @property model
**/
model: undefined,
/**
* Is it installed from an official store ?
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}}
* @property production
**/
production: undefined,
/**
* The url that was called to launch the app
* @property initUrl
**/
initUrl: ''
};
 
/**
* Manipulate files on local filesystem
* @class filesystem
**/
jembe.filesystem = {
/**
* Remove a file<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}}
* @method remove
* @params {Object} params
* @params {String} params.src The name of the file to remove
* @params {String} params.dir The directory of the file (may be DBDIR or undefined)
**/
remove: function(params) {
params.type = "delete";
jembe._execute("filesystem", params);
},
/**
* Open a file selector to get a path<br>
* {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
*
* @method getPath
* @params {Object} params
* @params {String} params.extensions List of extension. Can by * for all files (The default). "dir" for only directories. Or any string like "images (*.png *.xpm *.jpg)"
* @params {Function} params.onSelected Function called with the name of the selected path as parameter.
**/
getPath: function(params) {
jembe._execute("filesystem", params);
}
};
 
/**
* Send alerts to the user
* @class alert
**/
jembe.alert = {
/**
* show an alert<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
*
* @method show
* @params {Object} params
* @params {String} params.title The title of the alert dialog
* @params {String} params.message The message show in the dialog
* @params {String} params.buttons The list of the buttons to show in the dialog
* @params {Function} params.onSuccess The method called when a user press a button.
**/
show: function(params) {
params.type = 'show';
jembe._execute("alert", params);
},
/**
* vibrate. on ipad, it only plays the vibration sound<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}}
*
* @method vibrate
**/
vibrate: function() {
var params = {'type': 'vibration'};
jembe._execute("alert", params);
},
/**
* emit a beep<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}}
*
* @method beep
**/
beep: function() {
var params = {'type': 'beep'};
jembe._execute("alert", params);
},
/**
* add a notification. <br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}}
*
* @method notify
* @params {Object} params
* @params {String} params.tickerText Text show in the status bar
* @params {String} params.contentTitle Title of the detail of the notifcation
* @params {String} params.contentText Text of the detail of the notifcation
* @params {String} params.notificationId optional: If set, you can modify the text of a notification
* @params {String} params.flag [only for android] flag for the notification: [message|service|remove]. Default is message
* @params {Function} params.onSuccess The method called when a user press a button.
 
**/
notify: function(params) {
params.type = 'notify';
jembe._execute("alert", params);
}
};
 
/**
* Interact with the user using keyboard, some native buttons, etc...
* @class control
**/
jembe.control = {
_keyListeners: [],
_stateListeners: [],
_eventListeners: [],
/**
* Listen for key pressed. <br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
*
* On android, the menu button is the code "82"
*
* @method listenKey
* @params {String} key The key code to listen
* @params {Function} callback The listener to call when the key is pressed
* @params {Boolean} preventDefault If true, the default key event is not executed
**/
listenKey: function(key, callback, preventDefault) {
if(!jembe.control._keyListeners[key]) {
jembe.control._keyListeners[key] = [];
}
jembe.control._keyListeners[key].push(callback);
jembe._execute("control", {action:"listenKey", key:key, preventDefault:preventDefault});
},
/**
* Strop listen for key. <br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
*
* On android, the menu button is the code "82"
*
* @method stopListenKey
* @params {String} key The key code to stop listenning
* @params {Function} callback The listener to call when the key is pressed
**/
stopListenKey: function(key, callback) {
if (jembe.control._keyListeners[key]) {
for (var i in jembe.control._keyListeners[key]) {
if (jembe.control._keyListeners[key].hasOwnProperty(i) && String(jembe.control._keyListeners[key][i]) === String(callback)) {
jembe.control._keyListeners[key].splice(i, 1);
}
}
}
},
/**
* Listen the state of the app<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
*
* @method listenState
* @params {Function} callback
**/
listenState: function(callback) {
jembe.control._stateListeners.push(callback);
},
/**
* Listen for some event<br>
* {{#icon "iOS"}}{{/icon}}
*
* This method is usefull to receive event from the remote control
* events are: toggle_play_pause, previous_track, next_track
* @method listenEvent
* @params {Function} callback Called with the event as parameter
**/
listenEvent: function(callback) {
jembe.control._eventListeners.push(callback);
},
keyPressed: function(key) {
for(var callback in jembe.control._keyListeners[key]) {
jembe.control._keyListeners[key][callback]();
}
},
stateChanged: function(newState) {
setTimeout(function() {
for(var callback in jembe.control._stateListeners) {
jembe.control._stateListeners[callback](newState);
}}, 0);
},
eventDispatched: function(e) {
setTimeout(function() {
for(var callback in jembe.control._eventListeners) {
jembe.control._eventListeners[callback](e);
}
}, 0);
},
/**
* Exit the app. <br>
* {#icon "Android"}}{{/icon}}
 
* @method quit
**/
quit: function() {
jembe._execute("control", {"action":"quit"});	
},
/**
* callback to be informed when jembe is initialized
* @property {Function} onReady called when jembe is initialized
**/
onReady: undefined
};
 
/**
* Manage internet connections
* @class internet
**/
jembe.internet = {
_listeners: [],
stateUpdate: function() {
for(var callback in jembe.internet._listeners) {
jembe.internet._listeners[callback]();
}
},
/**
* Get the status of the internet connection<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
*
* Valid status are "Reachable" and "NotReachable"
* @property status
**/
status: "waiting",
/**
* Get the tpe of connection<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
*
* Valid type are "unknown", "3G", "WIFI", "No connection"
* @property type
**/
type: undefined,
/**
* listen for status changes.<br>
* {{#icon "iOS"}}{{/icon}} {{#icon "Android"}}{{/icon}} {{#icon "Windows"}}{{/icon}} {{#icon "MacOSX"}}{{/icon}} {{#icon "Linux"}}{{/icon}}
*
* @method listen
* @params {Function} callback Called when the status of the connection change
**/
listen: function(callback) {
jembe._execute("internet", {});
jembe.internet._listeners.push(callback);
}
};
jembe.accel = {
execute: function(params) {
jembe._execute("accel", params);
}
};
 
/**
* Interact with the user using keyboard, some native buttons, etc...
* @class settings
**/
jembe.settings= {
/**
* Change a settings<br>
* {{#icon "iOS"}}{{/icon}}
*
* @method set
* @params {Object} params
* @params {String} params.param status-bar-style or badge-number
* @params {String} params.value The value
*
**/
set: function(params) {
jembe._execute("settings", params);
}
};
 
} catch (err) {
console.log(err.message);
}
 
 
 
