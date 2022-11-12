
// TODO 1 redirect callback
LSF.prototype.onCardsChanged = function(_node) {
	// Use traditional 'for loops' for IE 11
	for (let mutation of mutationsList) {
		// const target = mutation.target;
		if (mutation.type === 'childList') {
			console.log('Update queued, ' + mutation.type + ' ' + mutation.target.attributes);
			this.queueUpdate();
		} else if (mutation.type === 'attributes') {
			//console.log('The ' + mutation.attributeName + ' attribute was modified.', target);
		}
	}
};

LSF.prototype.onJobDetailsChanged = function(_node) {
	console.log('Details changed');
}

LSF.prototype.callIfMatches = function(addedNode, track){
    for (const pair of track){
        if (addedNode.matches(pair[0]))
            pair[1]();
    }
}

LSF.prototype.onMutation = function (mutationRecords, _observer) {

    for (const mutation of mutationRecords) {
        mutation.addedNodes.forEach((node) => {
			this.callIfMatches(node, track);
        });
    }
};

LSF.addObserveInstruction = function(a_selector, a_callback) {
	return {selector: a_selector, callback: a_callback};
};


LSF.prototype.startObservers = function() {
	console.log('Starting observers');

	let _AI = LSF.addObserveInstruction;
	this.observeInstructions =  [
		_AI(LSF.SELECTORS.CARDS, this.onCardsChanged),
		_AI(LSF.SELECTORS.DETAIL_ALL, this.onJobDetailsChanged),
	];

	// Will filter out elements above, but not below
	// filtering elemnts below still needs to be done manually
	this.observeSelectors = this.observeInstructions.map(i=>(i.selector))

	this.observer = new MutationObserver(this.onMutation.bind(this));
	const config = {attributeFilter: this.observeSelectors, childList: true, subtree: true};
	this.observer.observe(document, config);

};
