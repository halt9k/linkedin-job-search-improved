
LSF.prototype.onCardsChanged = function(_node) {
	console.assert(typeof(this) === LSF);
	console.log('Cards update queued');

	this.queueUpdate();
};

LSF.prototype.onJobDetailsChanged = function(_node) {
	console.assert(typeof(this) === LSF);
	console.log('Details update queued');

}

LSF.prototype.callIfMatches = function(node){
    for (const pair of this.observeInstructions){
        if (node.matches(pair.selector))
            pair.callback.bind(this)();
    }
}

LSF.prototype.onMutation = function (mutationRecords, _observer) {
	console.log('Mutation fired')

	// Use traditional 'for loops' for IE 11
    for (const mutation of mutationRecords) {
    	//if (mutation.type === 'childList')
    	this.callIfMatches(mutation.target);
    }
};

LSF.addObserveInstruction = function(a_selector, a_callback) {
	return {selector: a_selector, callback: a_callback};
};


LSF.prototype.startObservers = function() {
	console.log('Starting observers');

	let _AI = LSF.addObserveInstruction;
	this.observeInstructions =  [
		_AI(LSF.SELECTORS.CARDS_LIST_CONTAINER, this.onCardsChanged),
		_AI(LSF.SELECTORS.DETAIL_ALL, this.onJobDetailsChanged),
	];

	// Will filter out elements above, but not below
	// filtering elemnts below still needs to be done manually
	this.observeSelectors = this.observeInstructions.map(i=>(i.selector))

	this.observer = new MutationObserver(this.onMutation.bind(this));
	const config = {attributeFilter: this.observeSelectors, childList: true, subtree: true};
	// this.observer.observe(document.childNodes[1], config);

	this.testCd = new LSF.NodeObserver(LSF.SELECTORS.CARDS_LIST_CONTAINER, false, this.updateDisplay);
	this.testOb = new LSF.NodeObserver(LSF.SELECTORS.DETAIL_ALL, false, this.onJobDetailsChanged);
};
