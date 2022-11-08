// ==UserScript==
// @name         LinkedIn Job Search Usability Improvements
// @namespace    http://tampermonkey.net/
// @version      0.2.11.3
// @description  Make it easier to review and manage job search results, with faster keyboard shortcuts, read post tracking, and blacklists for companies and jobs
// @author       Bryan Chan, halt9k
// @match        https://www.linkedin.com/jobs/search/*
// @license      GNU GPLv3
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require      file:///V:\lsf_utility.js
// @require      file:///V:\lsf_persistent.js
// @require      file:///V:\lsf_selectors.js
// @require      file:///V:\lsf_navigation.js
// @require      file:///V:\lsf_ratings.js
// @require      file:///V:\lsf_display.js
// @require      file:///V:\lsf.user.js
// ==/UserScript==

/** Event handler functions */
LSF.prototype.keyListener = function(e) {
	if (this.isSeacrhActive())
		return;

	/** Install key handlers to allow for keyboard interactions */
	const KEY_HANDLER = {
		'e': this.handleMarkRead, // toggle marking the active post as read
		's': this.goToNext, // open the next visible job post
		'w': this.goToPrevious, // open the previous visible job post
		'h': this.toggleHidden, // toggle showing the hidden posts
		'd': this.handleNextPage, // go to the next page
		'a': this.handlePrevPage, // go to the previous page
		'x': this.handleHidePost, // hide post forever,
		'X': this.handleShowPost, // show post again
		'y': this.handleHideCompany, // hide company forever
		'Y': this.handleShowCompany, // show company again
		'?': this.handlePrintDebug, // print debug information to the console
	};

	let handler = KEY_HANDLER[e.key];
	if (!handler)
		return;

	handler.bind(this)();
};

LSF.prototype.jobListObserver = function(mutationsList, observer) {
	// Use traditional 'for loops' for IE 11
	for (let mutation of mutationsList) {
		// const target = mutation.target;
		if (mutation.type === 'childList') {
			// console.log('Update queued, ' + mutation.type + ' ' + mutation.target.attributes);
			this.queueUpdate();
		} else if (mutation.type === 'attributes') {
			//console.log('The ' + mutation.attributeName + ' attribute was modified.', target);
		}
	}
};

// Start observing the target node for configured mutations
LSF.prototype.startObserve = function(jNode) {
	this.observer = new MutationObserver(this.jobListObserver.bind(this));

	console.log('Adding mutation observer');
	const config = {attributes: false, childList: true, subtree: true};
	this.observer.observe(this.getJobsList(), config);

	window.addEventListener('keydown', this.keyListener.bind(this));
};

LSF.prototype.attach = function(dummy) {
	console.log('Starting LinkedIn Job Search Usability Improvements');

	/** Add styles to handle hiding */
	GM_addStyle(`.${LSF.SELECTORS.CARDS_LIST_CLASS} { display: none }`);
	GM_addStyle('.hidden { display: none }');
	GM_addStyle('.read { opacity: 0.3 }');

	this.startObserve();
};

const lsf = new LSF();

// debug via window.lsf
unsafeWindow.LSF = LSF;
unsafeWindow.lsf = lsf;

// waitForKeyElements uses $
const $ = window.jQuery;
waitForKeyElements(LSF.SELECTORS.CARDS_LIST_CONTAINER, lsf.attach.bind(lsf));
