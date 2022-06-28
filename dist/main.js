/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

//require('../node_modules/@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.css');

var SDK = __webpack_require__(1);
var sdk = new SDK(null, null, true); // 3rd argument true bypassing https requirement: not prod worthy

var address, width, height, zoom, link, mapsKey;

function debounce (func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

function paintSettings () {
	document.getElementById('text-input-id-0').value = mapsKey;
	document.getElementById('text-input-id-1').value = address;
	document.getElementById('slider-id-01').value = width;
	document.getElementById('slider-id-02').value = height;
	document.getElementById('slider-id-03').value = zoom;
}

function paintSliderValues () {
	document.getElementById('slider-id-01-val').innerHTML = document.getElementById('slider-id-01').value;
	document.getElementById('slider-id-02-val').innerHTML = document.getElementById('slider-id-02').value;
	document.getElementById('slider-id-03-val').innerHTML = document.getElementById('slider-id-03').value;
}

function paintMap() {
	mapsKey = document.getElementById('text-input-id-0').value;
	address = document.getElementById('text-input-id-1').value;
	width = document.getElementById('slider-id-01').value;
	height = document.getElementById('slider-id-02').value;
	zoom = document.getElementById('slider-id-03').value;
	link = document.getElementById('text-input-id-2').value;
	if (!address) {
		return;
	}
	var url = 'https://maps.googleapis.com/maps/api/staticmap?center=' +
		address.split(' ').join('+') + '&size=' + width + 'x' + height + '&zoom=' + zoom +
		'&markers=' + address.split(' ').join('+') + '&key=' + mapsKey;
	sdk.setContent('<a href="' + link + '"><img src="' + url + '" /></a>');
	sdk.setData({
		address: address,
		width: width,
		height: height,
		zoom: zoom,
		link: link,
		mapsKey: mapsKey
	});
	localStorage.setItem('googlemapsapikeyforblock', mapsKey);
}

sdk.getData(function (data) {
	address = data.address || '';
	width = data.width || 400;
	height = data.height || 300;
	zoom = data.zoom || 15;
	link = data.link || '';
	mapsKey = data.mapsKey || localStorage.getItem('googlemapsapikeyforblock');
	paintSettings();
	paintSliderValues();
	paintMap();
});

document.getElementById('workspace').addEventListener("input", function () {
	debounce(paintMap, 500)();
	paintSliderValues();
});


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

var SDK = function (config, whitelistOverride, sslOverride) {
	// config has been added as the primary parameter
	// If it is provided ensure that the other paramaters are correctly assigned
	// for backwards compatibility
	if (Array.isArray(config)) {
		whitelistOverride = config;
		sslOverride = whitelistOverride;
		config = undefined;
	}

	this._whitelistOverride = whitelistOverride;
	this._sslOverride = sslOverride;
	this._messageId = 1;
	this._messages = {
		0: function () {}
	};
	this._readyToPost = false;
	this._pendingMessages = [];
	this._receiveMessage = this._receiveMessage.bind(this);

	window.addEventListener('message', this._receiveMessage, false);

	window.parent.postMessage({
		method: 'handShake',
		origin: window.location.origin,
		payload: config
	}, '*');
};

SDK.prototype.execute = function execute (method, options) {
	options = options || {};
	
	var self = this;
	var payload = options.data;
	var callback = options.success;

	if (!this._readyToPost) {
		this._pendingMessages.push({
			method: method,
			payload: payload,
			callback: callback
		});
	} else {
		this._post({
			method: method,
			payload: payload
		}, callback);
	}
};

SDK.prototype.getCentralData = function (cb) {
	this.execute('getCentralData', {
		success: cb
	});
};

SDK.prototype.getContent = function (cb) {
	this.execute('getContent', {
		success: cb
	});
};

SDK.prototype.getData = function (cb) {
	this.execute('getData', {
		success: cb
	});
};

SDK.prototype.getUserData = function (cb) {
	this.execute('getUserData', {
		success: cb
	});
};

SDK.prototype.getView = function (cb) {
	this.execute('getView', {
		success: cb
	});
};

SDK.prototype.setBlockEditorWidth = function (value, cb) {
	this.execute('setBlockEditorWidth', {
		data: value,
		success: cb
	});
};

SDK.prototype.setCentralData = function (dataObj, cb) {
	this.execute('setCentralData', {
		data: dataObj, 
		success: cb
	});
};

SDK.prototype.setContent = function (content, cb) {
	this.execute('setContent', {
		data: content, 
		success: cb});
};

SDK.prototype.setData = function (dataObj, cb) {
	this.execute('setData', {
		data: dataObj, 
		success: cb
	});
};

SDK.prototype.setSuperContent = function (content, cb) {
	this.execute('setSuperContent', {
		data: content, 
		success: cb
	});
};

SDK.prototype.triggerAuth = function (appID) {
	this.getUserData(function (userData) {
		var stack = userData.stack;
		if (stack.indexOf('qa') === 0) {
			stack = stack.substring(3,5) + '.' + stack.substring(0,3);
		}
		var iframe = document.createElement('IFRAME');
		iframe.src = 'https://mc.' + stack + '.exacttarget.com/cloud/tools/SSO.aspx?appId=' + appID + '&restToken=1&hub=1';
		iframe.style.width= '1px';
		iframe.style.height = '1px';
		iframe.style.position = 'absolute';
		iframe.style.top = '0';
		iframe.style.left = '0';
		iframe.style.visibility = 'hidden';
		iframe.className = 'authframe';
		document.body.appendChild(iframe);
	});
};

/* Internal Methods */

SDK.prototype._executePendingMessages = function _executePendingMessages () {
	var self = this;

	this._pendingMessages.forEach(function (thisMessage) {
		self.execute(thisMessage.method, {
			data: thisMessage.payload, 
			success: thisMessage.callback
		});
	});

	this._pendingMessages = [];
};

SDK.prototype._post = function _post (payload, callback) {
	this._messages[this._messageId] = callback;
	payload.id = this._messageId;
	this._messageId += 1;
	// the actual postMessage always uses the validated origin
	window.parent.postMessage(payload, this._parentOrigin);
};

SDK.prototype._receiveMessage = function _receiveMessage (message) {
	message = message || {};
	var data = message.data || {};

	if (data.method === 'handShake') {
		if (this._validateOrigin(data.origin)) {
			this._parentOrigin = data.origin;
			this._readyToPost = true;
			this._executePendingMessages();
			return;
		}
	}

	// if the message is not from the validated origin it gets ignored
	if (!this._parentOrigin || this._parentOrigin !== message.origin) {
		return;
	}
	// when the message has been received, we execute its callback
	(this._messages[data.id || 0] || function () {})(data.payload);
	delete this._messages[data.id];
};

// the custom block should verify it is being called from the marketing cloud
SDK.prototype._validateOrigin = function _validateOrigin (origin) {
	// Make sure to escape periods since these strings are used in a regular expression
	var allowedDomains = this._whitelistOverride || ['exacttarget\\.com', 'marketingcloudapps\\.com', 'blocktester\\.herokuapp\\.com'];

	for (var i = 0; i < allowedDomains.length; i++) {
		// Makes the s optional in https
		var optionalSsl = this._sslOverride ? '?' : '';
		var mcSubdomain = allowedDomains[i] === 'exacttarget\\.com' ? 'mc\\.' : '';
		var whitelistRegex = new RegExp('^https' + optionalSsl + '://' + mcSubdomain + '([a-zA-Z0-9-]+\\.)*' + allowedDomains[i] + '(:[0-9]+)?$', 'i');

		if (whitelistRegex.test(origin)) {
			return true;
		}
	}

	return false;
};

if (typeof(window) === 'object') {
	window.sfdc = window.sfdc || {};
	window.sfdc.BlockSDK = SDK;
}
if (true) {
	module.exports = SDK;
}


/***/ })
/******/ ]);