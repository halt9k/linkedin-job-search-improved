LSF.DIRECTION = {
	UP: 1, DOWN: 2,
};

LSF.prototype.cardBelow = function(jobCardEl) {
	return jobCardEl.nextElementSibling;
}

LSF.prototype.cardAbove = function(jobCardEl) {
	return jobCardEl.previousElementSibling;
};

LSF.prototype.jobClickTarget = function(jobCardEl) {
	return jobCardEl.firstElementChild.firstElementChild;
};

LSF.prototype.handleNextPage = function() {
	const activePage = document.querySelector(LSF.SELECTORS.ACTIVE_PAGE);
	if (!activePage || !activePage.nextElementSibling)
		return;

	const nextPage = activePage.nextElementSibling.firstElementChild;
	this.triggerClick(nextPage);
};

LSF.prototype.handlePrevPage = function() {
	const activePage = document.querySelector(LSF.SELECTORS.ACTIVE_PAGE);
	if (!activePage || !activePage.previousElementSibling)
		return;

	const prevPage = activePage.previousElementSibling.firstElementChild;
	this.triggerClick(prevPage);
};

/** Select first card in the list */
LSF.prototype.goToFirst = function() {
	const firstPost = this.getFirstCard();
	const clickableDiv = this.jobClickTarget(firstPost);
	this.triggerClick(clickableDiv);
};

LSF.prototype.getNextCard = function(active, direction) {
	let next = active;

	for (let i = 0; i < LSF.LOOP_SAFE_LIMIT; i++) {
		if (direction === LSF.DIRECTION.UP)
			next = this.cardAbove(next);

		if (direction === LSF.DIRECTION.DOWN)
			next = this.cardBelow(next);

		if (!next || this.isCardVisible(next))
			break;
	}
	return next;
};

LSF.prototype.shiftJobCard = function(direction) {
	const active = this.getActiveCard();
	if (!active) {
		this.goToFirst();
		return;
	}

	const nextCard = this.getNextCard(active, direction);

	if (nextCard && nextCard.firstElementChild) {
		this.triggerClick(this.jobClickTarget(nextCard));
	} else {
		// no previous job, try to shift page
		// yep, select case is worse than ifs
		if (direction === LSF.DIRECTION.UP)
			this.handlePrevPage();
		if (direction === LSF.DIRECTION.DOWN)
			this.handleNextPage();
	}
};

LSF.prototype.goToPrevious = function() {
	this.shiftJobCard(LSF.DIRECTION.UP);
};

LSF.prototype.goToNext = function() {
	this.shiftJobCard(LSF.DIRECTION.DOWN);
};
