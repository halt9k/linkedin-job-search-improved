// NodeObserver is necessary to extend MutationObserver:
// - to track nodes which still don't exist
// - to track when dynamic requests finished
//      for example, dynamic update after LinkedIn page scroll
//      none of common observers/events can handle proprly last one,
//      therefore query check is used

LSF.NodeObserver = class {
	constructor(a_rules) {
		this.nodeData = {}

		for (const [a_selector, a_callback] of Object.entries(a_rules)) {
			this.nodeData[a_selector] = {
				observer: new MutationObserver(this.onChanges.bind(this, a_selector)),
				callback: a_callback,
				fired: false,
				node: null,
			};
		}

		this.tryObserve();
	}
};


LSF.NodeObserver.prototype.tryObserve = function() {
	// let new_nodes = nodes.filter(n => !this.prev_nodes.includes(n));

	const config = {childList: true, subtree: true, attributeFilter: ['class']};
	for (const [selector, data] of Object.entries(this.nodeData)) {
		if (data.node)
			continue;

		data.node = document.querySelector(selector);
		if (data.node)
			data.observer.observe(data.node, config);

		this.nodeData[selector] = data;
	}
};

LSF.NodeObserver.prototype.onChanges = function(selector, _mutilations, _observer) {
	this.nodeData[selector].fired = true;

	if (this.isUpdateFinished()) {
		// console.log('Page updated finished, firing queue');
		this.fireChanges();
	}
};

LSF.NodeObserver.prototype.isUpdateFinished = function() {
	let nodes = Object.values(this.nodeData).map(d => d.node);
	let valid_nodes = nodes.filter(n => !!n);
	let updates = valid_nodes.filter(n => !!n.querySelector(LSF.SELECTORS.PAGE_UPDATE_PLACEHOLDERS));
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

	this.tryObserve();
};
