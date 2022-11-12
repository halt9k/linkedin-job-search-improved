
LSF.prototype.addStyles = function(){
	/** Add styles to handle hiding */
	GM_addStyle(`.${LSF.SELECTORS.CARDS_LIST_CLASS} { display: none }`);
	GM_addStyle('.hidden { display: none }');
	GM_addStyle('.read { opacity: 0.3 }');
}

// Toggle whether to hide posts
LSF.prototype.createDisplay = function() {
	this.showHidden = false;
	this.updateTimer = null;
};

LSF.prototype.queueUpdate = function() {
	if (this.updateTimer)
		clearTimeout(this.updateTimer);

	this.updateTimer = setTimeout(() => {
		this.updateTimer = null;
		this.updateDisplay();
	}, 30);
};

LSF.prototype.toggleHidden = function() {
	this.showHidden = !this.showHidden;
	this.queueUpdate();
};

/** Check if a card is hidden */
LSF.prototype.isCardVisible = function(jobCardEl) {
	let node = jobCardEl.firstElementChild;
	if (!node)
		return false;

	let hidden = node.classList.contains(LSF.SELECTORS.CARDS_LIST_CLASS) ||
	             node.classList.contains('hidden');
	return !hidden;
};

// Handle a request to hide a post forever
LSF.prototype.handleHidePost = function() {
	const activeJob = this.getActiveCard();
	const data = this.getCardData(activeJob);

	// Show feedback
	activeJob.style.opacity = 0.6;
	const postTitle = this.getPostTitle(activeJob);
	postTitle.style.textDecoration = 'line-through';

	const detailPostTitle = document.querySelector(LSF.SELECTORS.DETAIL_POST_TITLE);
	detailPostTitle.style.textDecoration = 'line-through';

	// Wait a little and then hide post
	setTimeout(() => {
		this.goToNext();
		detailPostTitle.style.textDecoration = 'none';
		this.hiddenPosts.set(data.postUrl,
		                     `${data.companyName}: ${data.postTitle}`);
		this.updateDisplay();
	}, LSF.FEEDBACK_DELAY);
};

// Handle a request to hide a post forever
LSF.prototype.handleShowPost = function() {
	const activeJob = this.getActiveCard();
	const data = this.getCardData(activeJob);

	this.goToNext();
	this.hiddenPosts.delete(data.postUrl);
	this.updateDisplay();
};

// Handle request to hide all posts from a company, forever
LSF.prototype.handleHideCompany = function() {
	const activeJob = this.getActiveCard();
	const data = this.getCardData(activeJob);

	// show feedback
	activeJob.style.opacity = 0.6;
	const company = this.getCompanyName(activeJob);
	company.style.textDecoration = 'line-through';

	const detailCompany = document.querySelector(LSF.SELECTORS.DETAIL_COMPANY);
	detailCompany.style.textDecoration = 'line-through';

	// Wait a little and then hide company
	setTimeout(() => {
		// go to next post and hide the company
		this.goToNext();
		detailCompany.style.textDecoration = 'none';
		this.hiddenCompanies.set(data.companyUrl, data.companyName);
		this.updateDisplay();
	}, LSF.FEEDBACK_DELAY);
};

// Handle request to hide all posts from a company, forever
LSF.prototype.handleShowCompany = function() {
	const activeJob = this.getActiveCard();
	const data = this.getCardData(activeJob);

	activeJob.style.opacity = 1.0;
	const company = this.getCompanyName(activeJob);
	company.style.textDecoration = 'none';

	const detailCompany = document.querySelector(LSF.SELECTORS.DETAIL_COMPANY);
	detailCompany.style.textDecoration = 'none';

	this.goToNext();
	this.hiddenCompanies.delete(data.companyUrl);
	this.updateDisplay();
};

// Handl request to mark a post as read (
LSF.prototype.handleMarkRead = function() {
	console.log('handleMarkRead');
	// @TODO implement this in a useful way
	const activeJob = this.getActiveCard();
	console.log(activeJob);
	const data = this.getCardData(activeJob);
	console.log(data);
	const previouslyMarkedRead = !!this.readPosts.get(data.postUrl);

	this.goToNext();
	if (previouslyMarkedRead) {
		console.log('mark unread', data.postUrl);
		this.readPosts.delete(data.postUrl);
	} else {
		console.log('mark read', data.postUrl);
		this.readPosts.set(data.postUrl,
		                   `${data.companyName}: ${data.postTitle}`);
	}
	this.updateDisplay();
};

LSF.prototype.updateCardDisplay = function(card) {
	const data = this.getCardData(card);
	const jobDiv = card.firstElementChild;

	if (this.showHidden) {
		jobDiv.classList.remove('hidden');
		return;
	}

	if (this.hiddenCompanies.get(data.companyUrl)) {
		jobDiv.classList.add('hidden');
	} else if (this.hiddenPosts.get(data.postUrl)) {
		jobDiv.classList.add('hidden');
	} else if (this.readPosts.get(data.postUrl)) {
		jobDiv.classList.add('read');
	} else {
		jobDiv.classList.remove('read');
	}
};



LSF.prototype.updateDisplay = function() {
	const start = +new Date();

	const cards = this.getCards();
	for (let i = cards.length - 1; i < 0; i--) {
		this.updateCardDisplay(cards[i]);
	}
	// TODO finsih
	this.calcScores();

	const elapsed = +new Date() - start;
	console.log('Updated display on jobs list in', elapsed, 'ms');
};