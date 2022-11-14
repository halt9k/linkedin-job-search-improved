// NodeObserver is necessary to extend MutationObserver:
// - to track nodes which still don't exist
// - to reduce calls after dynamic requests

LSF.NodeObserver = class {
	QUEUE_DELAY_MS = 100;

	constructor(a_selector, a_id, a_observeRecursive, a_callback, a_minChildsLoaded) {
		console.assert(!a_selector !== !a_id);

		this.selector = a_selector;
		this.id = a_id;
		this.updateTimer = null;
		this.createObserver = null;
		this.modifyObserver = null;
		this.callback = a_callback;
		this.observeChilds = a_observeRecursive;
		this.minChildsLoaded = a_minChildsLoaded;

		this.waitForNodeCreated();
	}
};

LSF.NodeObserver.prototype.tryFindNode = function() {
	if (this.selector)
		return document.querySelector(this.selector)
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
	let config;
	if (this.observeChilds) {
		config = {childList: true, subtree: false, attributes: false};
	} else {
		config = {childList: true, subtree: false, attributes: false};
		//node = node.parentNode;
	}

	this.modifyObserver.observe(node, config);

	// MutationObserver fires randomly, can be also before node created
	this.onNodeChanged();
};

LSF.NodeObserver.prototype.nodeHasChilds = function() {
	let node = this.tryFindNode();
	return !!node && node.hasChildNodes();
}

LSF.NodeObserver.prototype.isNodeLoading = function() {
	let node = this.tryFindNode();

	if (!node)
		return true;

	return node.childNodes.length < this.minChildsLoaded;
}

LSF.NodeObserver.prototype.onNodeChanged = function() {
	if (this.updateTimer)
		clearTimeout(this.updateTimer);

	if (this.isNodeLoading()) {
		console.log('Node update fired before node loaded: ' + this.id)

		// Mutilation observer must fire again later
		this.updateTimer = null;
		return;
	}

	this.updateTimer = setTimeout(() => {
		this.updateTimer = null;
		this.callback();
	}, this.QUEUE_DELAY_MS);
};
