// ==UserScript==
// @name         LinkedIn Job Search Usability Improvements
// @namespace    http://tampermonkey.net/
// @version      0.2.11.3
// @description  Make it easier to review and manage job search results, with faster keyboard shortcuts, read post tracking, and blacklists for companies and jobs
// @author       Bryan Chan, halt9k
// @match        https://www.linkedin.com/jobs/search/*
// @match        file:///V:\test\*
// @license      GNU GPLv3
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      file:///v:\src\lsf_utility.js
// @require      file:///v:\src\lib\wordhighlighter-master\src\imports\imports.js
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\common\dao.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\common\blocklist.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\common\dictionaryEntry.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\common\group.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\common\logger.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\common\settings.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\dom\domTraversal.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\dom\highlightGenerator.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\dom\highlightInjector.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\dom\pageStatsInfoGenerator.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\highlightingLog\highlightingLog.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\highlightingLog\highlightingLogEntry.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\matching\cachingStemmer.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\matching\matchFinder.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\matching\matchResultEntry.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\matching\stemmer.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\matching\token.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\matching\tokenizer.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\matching\trie.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\pageStats\pageStats.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\pageStats\wordAppearanceStats.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\mainDialog\app.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\mainDialog\groupsController.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\mainDialog\historyController.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\mainDialog\importExportController.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\mainDialog\settingsController.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\mainDialog\toSafeHtmlFilter.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\mainDialog\websiteLists.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\mainDialog\wordsController.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\background.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\lib\content.ts
// @require      file:///v:\src\lib\wordhighlighter-master\src\scripts\embedded-content-script.ts
// @require      file:///v:\src\lsf_persistent.js
// @require      file:///v:\src\lsf_selectors.js
// @require      file:///v:\src\lsf_navigation.js
// @require      file:///v:\src\lsf_observe_helper.js
// @require      file:///v:\src\lsf_observe.js
// @require      file:///v:\src\lsf_ratings.js
// @require      file:///v:\src\lsf_display.js
// @require      file:///v:\src\lsf.user.js
// ==/UserScript==

/* globals LSF, unsafeWindow, console */

/** Event handler functions */
LSF.prototype.keyListener = function(e) {
	if (!this.isHotkeyExpected())
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