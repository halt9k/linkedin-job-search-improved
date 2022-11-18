/** Selectors for key elements */
LSF.SELECTORS = {
	// CARDS_LIST: '.jobs-search-results-list',
	CARDS_LIST_CONTAINER: '.scaffold-layout__list-container',

	CARDS: '.jobs-search-results__list-item',
	ACTIVE_CARD: '.jobs-search-results-list__list-item--active',
	CARDS_LIST_CLASS: '.jobs-list-feedback',

	// .job-card-container__company-name without .ember-view
	// will get also names of companies
	// which do not have registered link, skipping them for now
	CARD_COMPANY_NAME: '.job-card-container__company-name.ember-view',
	CARD_POST_TITLE: '.job-card-list__title',

	DETAILS_ALL: '.jobs-search__job-details--container',
	DETAILS_TITLE: '.jobs-unified-top-card__job-title',
	DETAILS_COMPANY: '.jobs-unified-top-card__company-name',
	DETAILS_DESC: '.jobs-description',

	ACTIVE_PAGE: '.artdeco-pagination__indicator--number.active',

	PAGE_UPDATE_PLACEHOLDERS: 'div[class*="ghost-placeholder"]',
};

LSF.SELECTORS.HOTKEYS_ACTIVE_OVER = [
	'body',
	'.jobs-search__job-details',
	'.jobs-description-content__text',
	LSF.SELECTORS.CARDS
];

LSF.prototype.tryQuery = function(selector, all, from_node) {
	if (!from_node)
		from_node = document;

	let ret_node = null;
	if (!all)
		ret_node = from_node.querySelector(selector);
	else
		ret_node = from_node.querySelectorAll(selector);

	if (!ret_node)
		console.warn('missing expected node on selector: ' +
		             selector.toString());
	return ret_node;
};

LSF.prototype.tryQuerySelectorAll = function(selector, from_node = null) {
	return this.tryQuery(selector, true, from_node);
};

LSF.prototype.tryQuerySelector = function(selector, from_node = null) {
	return this.tryQuery(selector, false, from_node);
};

/** Extracts card data from a card */
LSF.prototype.getCompanyName = function(node) {
	return this.tryQuerySelector(LSF.SELECTORS.CARD_COMPANY_NAME, node);
};

LSF.prototype.getPostTitle = function(node) {
	return this.tryQuerySelector(LSF.SELECTORS.CARD_POST_TITLE, node);
};

LSF.prototype.getJobsList = function() {
	return this.tryQuerySelector(LSF.SELECTORS.CARDS_LIST_CONTAINER);
};

LSF.prototype.getCards = function(toIncludeEmpty = false) {
	let possible_cards = document.querySelectorAll(LSF.SELECTORS.CARDS);
	let arr_cards = Array.from(possible_cards);
	if (!toIncludeEmpty)
		return arr_cards.filter(card => !!card.firstElementChild);
	else
		return arr_cards;
};

LSF.prototype.getFirstCard = function() {
	return this.getCards().first;
};

/** Get active job card */
LSF.prototype.getActiveCard = function() {
	const active = this.tryQuerySelector(LSF.SELECTORS.ACTIVE_CARD);
	return active ? active.parentNode.parentNode : undefined;
};

LSF.prototype.getCardData = function(node) {
	let companyUrl, companyName, postUrl, postTitle;
	const company = this.getCompanyName(node);
	if (company) {
		companyUrl = company.getAttribute('href').split('?')[0];
		companyName = company.text.trim(' ');
	}

	const post = this.getPostTitle(node);
	if (post) {
		postUrl = post.getAttribute('href').split('/?')[0];
		postTitle = post.text.replace('Promoted', '').trim(' \n');
	}
	return {companyUrl, companyName, postUrl, postTitle};
};

LSF.prototype.isHotkeyExpected = function() {
	let active = document.activeElement;
	return active.matches(LSF.SELECTORS.HOTKEYS_ACTIVE_OVER);
};