// NodeObserver is necessary to extend MutationObserver:
// - to track nodes which still don't exist
// - to track when dynamic requests finished
//      for example, dynamic update after LinkedIn page scroll
//      none of common observers/events can handle proprly last one,
//      therefore query check is used

LSF.NodeObserver = class {
	QUEUE_DELAY_MS = 10;

	constructor(a_selector,
	            a_id,
	            a_observeRecursive,
	            a_callback) {
		console.assert(!a_selector !== !a_id);

		this.selector = a_selector;
		this.id = a_id;
		this.callback = a_callback;
		this.observeChilds = a_observeRecursive;

		this.createObserver = null;
		this.modifyObserver = null;

		this.waitForNodeCreated();
	}
};

LSF.NodeObserver.prototype.tryFindNode = function() {
	if (this.selector)
		return document.querySelector(this.selector);
	else
		return document.getElementById(this.id);
};

LSF.NodeObserver.prototype.waitForNodeCreated = function() {
	if (this.tryFindNode()) {
		this.onNodeCreated();
		return;
	}

	this.createObserver = new MutationObserver(this.onNodeCreated.bind(this));
	const config = {childList: true, subtree: true};
	this.createObserver.observe(document.body, config);
};

LSF.NodeObserver.prototype.onNodeCreated = function() {
	let node = this.tryFindNode();
	if (!node || this.modifyObserver)
		return;

	if (this.createObserver) {
		this.createObserver.disconnect();
		this.createObserver = null;
	}

	this.modifyObserver = new MutationObserver(this.onNodeChanged.bind(this));
	this.observerConfig = {childList: this.observeChilds, subtree: false, attributes: !this.observeChilds};

	this.modifyObserver.observe(node, this.observerConfig);

	// MutationObserver fires randomly, can be also before node created
	this.onNodeChanged();
};


LSF.NodeObserver.isPageLoaded = function(){
	return !document.querySelector(LSF.SELECTORS.PAGE_LOADING_NODE_PLACEHOLDER);
}

LSF.NodeObserver.delayedCalls = [];
LSF.NodeObserver.waitPageLoad = function(onContinue) {
	let _NO = LSF.NodeObserver;
	if (!_NO.isPageLoaded()) {
		_NO.delayedCalls.push(onContinue);
	} else {
		_NO.delayedCalls.forEach(f => f());
		_NO.delayedCalls.clear();
	}

};

LSF.NodeObserver.prototype.onNodeChanged = function() {

	this.modifyObserver.disconnect();
	LSF.NodeObserver.waitPageLoad(() => {
		this.callback();
		this.modifyObserver.observe(this.tryFindNode(), this.observerConfig);

		// if (this.fireOnce)
		// this.modifyObserver.detach();
		// this.modifyObserver = null;
	});
};
