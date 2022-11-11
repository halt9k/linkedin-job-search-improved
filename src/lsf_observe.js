


LSF.prototype.attachObserver = function(target: Node, callback: function) {
	addedNode.matches('.job-card-list')
};


// Start observing the target node for configured mutations
LSF.prototype.startObserver = function(source: Node) {
	this.cardsObserver = new MutationObserver(this.cardsChanged.bind(this));

	console.log('Adding mutation observer');
	const config = {attributes: false, childList: true, subtree: true};
	this.cardsObserver.observe(this.getJobsList(), config);
};

new MutationObserver(() => {
  console.log('mutation on document body');
  // rest of the code you need when an element is appended
}).observe( document.body, { childList: true })

LSF.prototype.startObservers = function() {

	window.addEventListener('keydown', this.keyListener.bind(this));
};