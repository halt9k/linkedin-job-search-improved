// ==UserScript==
// @name         LinkedIn Job Search Usability Improvements
// @namespace    http://tampermonkey.net/
// @version      0.2.11.3
// @description  Make it easier to review and manage job search results, with faster keyboard shortcuts, read post tracking, and blacklists for companies and jobs
// @author       Bryan Chan, halt9k
// @match        https://www.linkedin.com/jobs/search/*
// @match        file:///V:/test/*
// @license      GNU GPLv3
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      file:///V:/src/lsf_utility.js
// @require      file:///V:/src/lsf_persistent.js
// @require      file:///V:/src/lsf_selectors.js
// @require      file:///V:/src/lsf_navigation.js
// @require      file:///V:/src/lsf_observe_helper.js
// @require      file:///V:/src/lsf_observe.js
// @require      file:///V:/src/lsf_ratings.js
// @require      file:///V:/src/lsf_display.js
// @require      file:///V:/src/lsf.user.js
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

LSF.prototype.attach = function() {
	console.log('Starting LinkedIn Job Search Usability Improvements');
	this.addStyles();

	this.startObservers();
	window.addEventListener('keydown', this.keyListener.bind(this));
};

const lsf = new LSF();

// debug via window.lsf
unsafeWindow.LSF = LSF;
unsafeWindow.lsf = lsf;

lsf.attach();