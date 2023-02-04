// NodeObserver is necessary to extend MutationObserver:
// - to track nodes which still don't exist
// - to track when dynamic requests finished
//      for example, dynamic update after LinkedIn page scroll
//      none of common observers/events can handle proprly last one,
//      therefore query check is used

/* globals LSF, unsafeWindow, console */

LSF.NodeObserver = class {
	constructor(a_rules) {
		this.nodeData = {};
		this.docData = {};

		for (const [a_selector, a_callback] of Object.entries(a_rules)) {
			this.nodeData[a_selector] = {
				observer: new MutationObserver(this.onChanges.bind(this, a_selector)),
				callback: a_callback,
				fired: false,
				node: null,
			};
		}

		this.startPageLoadObserver();
	}
};


LSF.NodeObserver.prototype.startPageLoadObserver = function() {
	this.docData.node = lsf.tryQuerySelector(LSF.SELECTORS.DOCUMENT, null, false);
	this.docData.observer = new MutationObserver(this.onDocumentChanged.bind(this));
	const config = {childList: true, subtree: true, attributeFilter: ['class']};
	this.docData.observer.observe(this.docData.node, config);
};


LSF.NodeObserver.prototype.onDocumentChanged = function() {
	this.tryObserve(false);

	let _obs = Object.values(this.nodeData).map(d => d.node)
	let attached_observers = _obs.filter(n => !!n);

	if (attached_observers.length > 0){
		console.log('Page load detected, detaching initial document observer');
		this.docData.observer.disconnect();
		this.docData.observer = null;
	}
}


LSF.NodeObserver.prototype.tryObserve = function(verbose) {
	// let new_nodes = nodes.filter(n => !this.prev_nodes.includes(n));

	const config = {childList: true, subtree: true, attributeFilter: ['class']};
	for (const [selector, data] of Object.entries(this.nodeData)) {
		if (data.node)
			continue;

		data.node = lsf.tryQuerySelector(selector, null, verbose);
		if (data.node)
			data.observer.observe(data.node, config);

		this.nodeData[selector] = data;
	}
};

LSF.NodeObserver.prototype.onChanges = function(selector, _mutilations, _observer) {
	this.nodeData[selector].fired = true;

	if (this.isUpdateFinished()) {
		// console.log('Page update finished, firing queue');
		this.fireChanges();
	}
};

LSF.NodeObserver.prototype.isUpdateFinished = function() {
	let nodes = Object.values(this.nodeData).map(d => d.node);
	let valid_nodes = nodes.filter(n => !!n);

	if (valid_nodes.length === 0)
		return false;

	let updates = valid_nodes.filter(n => !!lsf.tryQuerySelector(LSF.SELECTORS.PAGE_UPDATING_PLACEHOLDERS, n, false));
	return updates.length === 0;
};

LSF.NodeObserver.prototype.fireChanges = function() {
	for (const [selector, data] of Object.entries(this.nodeData)) {
		if (!data.fired)
			continue;

		data.observer.disconnect();
		data.node = null;

		data.callback();
		data.fired = false;
		this.nodeData[selector] = data;
	}

	// not all elements exist during first call, therefore multiple attempts
	this.tryObserve(true);
};
