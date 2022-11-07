'use strict';

class LSF {
	constructor() {
		this.createDisplay();
		this.createStorage();
	}
}

LSF.LOOP_SAFE_LIMIT = 50;
LSF.FEEDBACK_DELAY = 300;

LSF.prototype.triggerMouseEvent = function(node, eventType) {
	const clickEvent = document.createEvent('MouseEvents');
	clickEvent.initEvent(eventType, true, true);
	node.dispatchEvent(clickEvent);
};

LSF.prototype.triggerClick = function(node) {
	this.triggerMouseEvent(node, 'mouseover');
	this.triggerMouseEvent(node, 'mousedown');
	this.triggerMouseEvent(node, 'mouseup');
	this.triggerMouseEvent(node, 'click');
};

LSF.prototype.fuzzy_match = function(text, pattern) {
	//_.memoize(function(pattern) {
	let cache = function(pattern) {
		return new RegExp(pattern.split('').reduce(function(a, b) {
			return a + '[^' + b + ']*' + b;
			}))
	};
	//});

	return cache(pattern).test(text);
};

LSF.fixFirefoxScriptCahche = function () {
	let url = `https://localhost:8000/src/linkedin_search_fixed.user.js?ts=${(+new Date())}`
	console.log('Cahche update attempt ' + url);

	GM.xmlHttpRequest({
	    method: "GET",
	    url: url,
	    onload: function(response) {
	        let remoteScript = document.createElement('script')
	        remoteScript.id = 'tm-dev-script'
	        remoteScript.innerHTML = response.responseText
	        document.body.appendChild(remoteScript)
	    }
	})
}
LSF.fixFirefoxScriptCahche();