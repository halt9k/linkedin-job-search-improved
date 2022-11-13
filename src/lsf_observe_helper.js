// NodeObserver is necessary to extend MutationObserver:
// - to track nodes which still don't exist
// - to reduce calls after dynamic events

LSF.NodeObserver = class {
	QUEUE_DELAY_MS = 100;

	constructor(a_selector, a_observeRecursive, a_callback) {
		this.selector = a_selector;
		this.updateTimer = null;
		this.createObserver = null;
		this.modifyObserver = null;
		this.callback = a_callback;
		this.observeChilds = a_observeRecursive;

		this.waitForNodeCreated();
	}

	tryFindNode = function(){};
	waitForNodeCreated = function(){};
}

LSF.NodeObserver.prototype.tryFindNode = function(){
	return document.querySelector(this.selector);
}

LSF.NodeObserver.prototype.waitForNodeCreated = function(){
	if (this.tryFindNode()){
		this.onNodeCreated();
		return;
	}

	this.createObserver = new MutationObserver(this.onNodeCreated.bind(this));
	const config = {childList: true, subtree: true};
	this.createObserver.observe(document.body, config);
}

LSF.NodeObserver.prototype.onNodeCreated = function(){
	let config = {}
	let node = this.tryFindNode()

	if (!node || this.modifyObserver)
		return;

	// excessive, but looks like async calls mess up
	if (this.createObserver) {
		this.createObserver.disconnect();
		this.createObserver = null;
	}

	this.modifyObserver = new MutationObserver(this.queueUpdate.bind(this));
	if (this.observeChilds){
		config = {childList: true, subtree: false, attributes: false};
	} else {
		config = {childList: true, subtree: false, attributes: false};
		//node = node.parentNode;
	}

	this.modifyObserver.observe(node, config);
	this.queueUpdate();
}

LSF.NodeObserver.prototype.queueUpdate = function() {
	if (this.updateTimer)
		clearTimeout(this.updateTimer);

	this.updateTimer = setTimeout(() => {
		this.updateTimer = null;
		this.callback();
	}, this.QUEUE_DELAY_MS);
};
