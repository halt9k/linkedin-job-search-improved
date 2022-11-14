LSF.prototype.onCardListChanged = function(_node) {
	console.assert(this instanceof LSF);
	console.log('Cards update queued');

	let card_list = this.getCards(true);
	let id_list = card_list.map(card => card.id)

	this.obsCards = this.obsCards.filter(obs => id_list.includes(obs.id))
	let unchanged_id_list = this.obsCards.map(obs => obs.id)

	let new_id_list = id_list.filter(id => !unchanged_id_list.includes(id))

	for (let id of new_id_list) {
		const node = document.getElementById(id);
		const obs = new LSF.NodeObserver(null, id, true, this.onCardChanged.bind(this, node), 5);
		this.obsCards.push(obs);
	}
};

LSF.prototype.onCardChanged = function(node) {
	console.assert(this instanceof LSF);
	console.assert(node instanceof Node);
	console.log('Card update queued');

	// hmm
	console.assert(node.firstElementChild);

	this.updateCardDisplay(node);
};

LSF.prototype.onJobDetailsChanged = function(_node) {
	console.assert(this instanceof LSF);
	console.log('Details update queued');

	this.updateDescription();
};

LSF.addObserveInstruction = function(a_selector, a_callback) {
	return {selector: a_selector, callback: a_callback};
};

LSF.prototype.startObservers = function() {
	console.log('Starting observers');

	let _AI = LSF.addObserveInstruction;
	this.observeInstructions = [
		_AI(LSF.SELECTORS.CARDS_LIST_CONTAINER, this.onCardListChanged),
		_AI(LSF.SELECTORS.DETAIL_ALL, this.onJobDetailsChanged),
	];

	// Will filter out elements above, but not below
	// filtering elemnts below still needs to be done manually
	this.observeSelectors = this.observeInstructions.map(i => (i.selector));

	this.obsCardList = new LSF.NodeObserver(LSF.SELECTORS.CARDS_LIST_CONTAINER,
	                                        null,
	                                        false,
	                                        this.onCardListChanged.bind(this),
	                                        5);
	this.obsDetails = new LSF.NodeObserver(LSF.SELECTORS.DETAIL_ALL,
	                                       null,
	                                       false,
	                                       this.onJobDetailsChanged.bind(
	                                       this),
	                                       3);
	this.obsCards = [];
};
