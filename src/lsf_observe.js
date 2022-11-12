
// TODO 1 redirect callback
LSF.prototype.onCardsChanged = function(mutationsList, observer) {
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

LSF.prototype.callIfMatches = function(addedNode, track){
    for (const pair of track){
        if (addedNode.matches(pair[0]))
            pair[1]();
    }
}

LSF.prototype.onMutation = function (mutationRecords, _observer) {
	//TODO
	// '.job-card-list'
	let track =  [[LSF.SELECTORS.CARDS_LIST_CONTAINER, this.onCardsChanged]];

    for (const mutation of mutationRecords) {
        mutation.addedNodes.forEach((node) => {
			this.callIfMatches(node, track);
        });
    }
};

LSF.prototype.startObservers = function() {
	this.observer = new MutationObserver(this.onMutation.bind(this));
	const config = {attributes: false, childList: true, subtree: true};
	this.observer.observe(document, config);

};
