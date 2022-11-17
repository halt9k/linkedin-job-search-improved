LSF.prototype.onCardListChanged = function() {
	console.assert(this instanceof LSF);
	console.log('Updating cards');

	this.updateCards();
};

LSF.prototype.onJobDetailsChanged = function() {
	console.assert(this instanceof LSF);
	console.log('Details update queued');

	this.updateDescription();
};

LSF.prototype.startObservers = function() {
	console.log('Starting observers');

	let rules = {};
	rules[LSF.SELECTORS.CARDS_LIST_CONTAINER] = this.onCardListChanged.bind(this);
	rules[LSF.SELECTORS.DETAILS_ALL] = this.onJobDetailsChanged.bind(this);

	this.nodeObserver = new LSF.NodeObserver(rules);
};
