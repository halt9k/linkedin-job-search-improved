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

LSF.prototype.perfLog = function(targetMethod) {
	const start = +new Date();

	targetMethod();

	const elapsed = +new Date() - start;
	console.log(targetMethod.name + ' elapsed: '+ elapsed + ' ms');
};