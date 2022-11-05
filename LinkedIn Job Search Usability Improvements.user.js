// ==UserScript==
// @name         LinkedIn Job Search Usability Improvements
// @namespace    http://tampermonkey.net/
// @version      0.2.11.1
// @description  Make it easier to review and manage job search results, with faster keyboard shortcuts, read post tracking, and blacklists for companies and jobs
// @author       Bryan Chan
// @match        https://www.linkedin.com/jobs/search/*
// @license      GNU GPLv3
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant       GM_xmlhttpRequest
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

(function() {
    'use strict';

    /** Selectors for key elements */
    const JOBS_LIST_SELECTOR = "div.jobs-search-results-list"
    const JOBS_LIST_CONTAINER_SELECTOR = ".scaffold-layout__list-container"
    const ACTIVE_JOB_SELECTOR = "div.jobs-search-results-list__list-item--active"
    const JOB_CARD_COMPANY_NAME_SELECTOR = "a.job-card-container__company-name"
    const JOB_CARD_POST_TITLE_SELECTOR = ".job-card-list__title"
    const JOB_SEARCH_RESULTS_FEEDBACK_CLASS = ".jobs-list-feedback"

    const DETAIL_POST_TITLE_SELECTOR = ".t-24.t-bold.jobs-unified-top-card__job-title"
    const DETAIL_COMPANY_SELECTOR = ".jobs-unified-top-card__company-name"

    const NEXT_PAGE_SELECTOR = ".artdeco-pagination__indicator--number.active"
    const PREV_PAGE_SELECTOR = ".artdeco-pagination__indicator--number.active"

    const LOOP_SAFE_LIMIT = 50

    function nextJobEl(jobCardEl) {
        return jobCardEl.nextElementSibling
    }

    function prevJobEl(jobCardEl) {
        return jobCardEl.previousElementSibling
    }

    function jobClickTarget(jobCardEl) {
        return jobCardEl.firstElementChild.firstElementChild
    }

    /** Check if a card is hidden */
    function isHidden (jobCardEl) {
        const node = jobCardEl.firstElementChild
        if(!node) return false;
        return node.classList.contains(JOB_SEARCH_RESULTS_FEEDBACK_CLASS) ||
            node.classList.contains("hidden");
    }



    console.log("Starting LinkedIn Job Search Usability Improvements");

    // Setup dictionaries to persist useful information across sessions
    class StoredDictionary {
        constructor(storageKey) {
            this.storageKey = storageKey;
            this.data = GM_getValue(storageKey) || {};
            console.log("Initial data read from", this.storageKey, this.data);
        }

        get(key) {
            return this.data[key];
        }

        set(key, value) {
            this.data[key] = value;
            GM_setValue(this.storageKey, this.data);
        }

        delete(key) {
            delete this.data[key];
            GM_setValue(this.storageKey, this.data);
        }

        getDictionary() {
            return this.data;
        }
    }

    const hiddenCompanies = new StoredDictionary("hidden_companies");
    const hiddenPosts = new StoredDictionary("hidden_posts");
    const readPosts = new StoredDictionary("read_posts");

    /** Install key handlers to allow for keyboard interactions */

    const KEY_HANDLER = {
        "e": handleMarkRead, // toggle marking the active post as read
        "s": goToNext, // open the next visible job post
        "w": goToPrevious, // open the previous visible job post
        "h": toggleHidden, // toggle showing the hidden posts
        "d": handleNextPage, // go to the next page
        "a": handlePrevPage, // go to the previous page
        "x": handleHidePost, // hide post forever,
        "X": handleShowPost, // show post again
        "y": handleHideCompany, // hide company forever
        "Y": handleShowCompany, // show company again
        "?": handlePrintDebug, // print debug information to the console
    }

    window.addEventListener("keydown", function(e) {
        const handler = KEY_HANDLER[e.key]
        if(handler) handler();
    });

    /** Event handler functions */
    const FEEDBACK_DELAY = 300;

    const DIRECTION = {
        UP: 1,
        DOWN: 2
    }

    // Toggle whether to hide posts
    var showHidden = false;
    function toggleHidden() {
        showHidden = !showHidden;
        queueUpdate();
    }

    // Handle a request to hide a post forever
    function handleHidePost() {
        const activeJob = getActive();
        const data = getCardData(activeJob);

        // Show feedback
        activeJob.style.opacity = 0.6;
        const postTitle = getPostNode(activeJob);
        postTitle.style.textDecoration = "line-through";

        const detailPostTitle = document.querySelector(DETAIL_POST_TITLE_SELECTOR);
        detailPostTitle.style.textDecoration = "line-through";

        // Wait a little and then hide post
        setTimeout(() => {
            goToNext();
            detailPostTitle.style.textDecoration = "none";
            hiddenPosts.set(data.postUrl, `${data.companyName}: ${data.postTitle}`);
            updateDisplay();
        }, FEEDBACK_DELAY);
    }

        // Handle a request to hide a post forever
    function handleShowPost() {
        const activeJob = getActive();
        const data = getCardData(activeJob);

        goToNext();
        hiddenPosts.delete(data.postUrl);
        updateDisplay();
    }

    // Handle request to hide all posts from a company, forever
    function handleHideCompany() {
        const activeJob = getActive();
        const data = getCardData(activeJob);

        // show feedback
        activeJob.style.opacity = 0.6;
        const company = getCompanyNode(activeJob);
        company.style.textDecoration = "line-through";

        const detailCompany = document.querySelector(DETAIL_COMPANY_SELECTOR);
        detailCompany.style.textDecoration = "line-through";

        // Wait a little and then hide company
        setTimeout(() => {
            // go to next post and hide the company
            goToNext();
            detailCompany.style.textDecoration = "none";
            hiddenCompanies.set(data.companyUrl, data.companyName);
            updateDisplay();
        }, FEEDBACK_DELAY);
    }

        // Handle request to hide all posts from a company, forever
    function handleShowCompany() {
        const activeJob = getActive();
        const data = getCardData(activeJob);

        activeJob.style.opacity = 1.0;
        const company = getCompanyNode(activeJob);
        company.style.textDecoration = "none";

        const detailCompany = document.querySelector(DETAIL_COMPANY_SELECTOR);
        detailCompany.style.textDecoration = "none";

        goToNext();
        hiddenCompanies.delete(data.companyUrl);
        updateDisplay();
    }


    const PAGE_DELAY = 300; // delay after loading new page to go to the first element


    function handleNextPage() {
        const activePage = document.querySelector(NEXT_PAGE_SELECTOR);
        if(!activePage || !activePage.nextElementSibling) return;

        const nextPage = activePage.nextElementSibling.firstElementChild;
        triggerClick(nextPage);
    }

    function handlePrevPage() {
        const activePage = document.querySelector(PREV_PAGE_SELECTOR);
        if(!activePage || !activePage.previousElementSibling) return;

        const prevPage = activePage.previousElementSibling.firstElementChild;
        triggerClick(prevPage);
    }


    // Handl request to mark a post as read (
    function handleMarkRead() {
        console.log('handleMarkRead')
        // @TODO implement this in a useful way
        const activeJob = getActive();
        console.log(activeJob)
        const data = getCardData(activeJob);
        console.log(data)
        const previouslyMarkedRead = !!readPosts.get(data.postUrl);

        goToNext();
        if(previouslyMarkedRead) {
            console.log('mark unread', data.postUrl)
            readPosts.delete(data.postUrl);
        } else {
            console.log('mark read', data.postUrl)
            readPosts.set(data.postUrl, `${data.companyName}: ${data.postTitle}`);
        }
        updateDisplay();
    }

    // Handle requests to print debug information
    function handlePrintDebug() {

        const companies = hiddenCompanies.getDictionary();
        console.log("Hidden companies", Object.keys(companies).length);
        console.log(companies);

        const posts = hiddenPosts.getDictionary();
        console.log("Hidden posts", Object.keys(posts).length);
        console.log(posts);

        const read = readPosts.getDictionary();
        console.log("Read posts", Object.keys(read).length);
        console.log(read);
    }

    /** Functions to adjust jobs list display, based on which companies, posts are hidden and which posts are read */
    function getJobsList() {
        return document.querySelectorAll(JOBS_LIST_SELECTOR)[0];
    }
    var updateQueued = false;
    var updateTimer = null;
    function queueUpdate() {
        if(updateTimer) {
            clearTimeout(updateTimer);
        }
        updateTimer = setTimeout(function() {
            updateTimer = null;
            updateDisplay()
        }, 30);
    }
    function updateDisplay() {
        const start = +new Date();
        const jobsListDiv = getJobsList();
        const jobsList = jobsListDiv.querySelector(JOBS_LIST_CONTAINER_SELECTOR)
        for(var job = jobsList.firstElementChild; job && job.nextSibling; job = nextJobEl(job)) {
            try {
                const data = getCardData(job);
                const jobDiv = job.firstElementChild;

                if(showHidden) {
                    jobDiv.classList.remove("hidden");
                    continue;
                }

                if(hiddenCompanies.get(data.companyUrl)) {
                    jobDiv.classList.add("hidden");
                } else if(hiddenPosts.get(data.postUrl)) {
                    jobDiv.classList.add("hidden");
                } else if(readPosts.get(data.postUrl)) {
                    jobDiv.classList.add("read");
                } else {
                    jobDiv.classList.remove("read");
                }

            } catch(e) {
            }
        }
        const elapsed = +new Date() - start;
        console.log("Updated display on jobs list in", elapsed, "ms");
    }

    function triggerMouseEvent (node, eventType) {
        var clickEvent = document.createEvent ('MouseEvents');
        clickEvent.initEvent (eventType, true, true);
        node.dispatchEvent (clickEvent);
    }

    /** Get active job card */
    function getActive() {
        const active = document.querySelector(ACTIVE_JOB_SELECTOR);
        return active ? active.parentNode.parentNode : undefined;
    }

    /** Select first card in the list */
    function goToFirst() {
        const jobsList = getJobsList();
        const firstPost = jobsList.firstElementChild;
        const clickableDiv = jobClickTarget(firstPost);
        triggerClick(clickableDiv);
    }

    function iterVisibleJobPage(active, direction) {
        var pg_shift = active

        for (let i = 0; i < LOOP_SAFE_LIMIT; i++) {
            if (direction == DIRECTION.UP) {
                pg_shift = prevJobEl(pg_shift);
            }
            if (direction == DIRECTION.DOWN){
                pg_shift = nextJobEl(pg_shift);
            }
            if (!pg_shift || !isHidden(pg_shift)) {
                return pg_shift;
            }
        }
    }

    function shiftWorkPage(direction) {
        const active = getActive();
        if(!active) {
            goToFirst();
            return;
        }

        var pgNext = iterVisibleJobPage(active, direction);

        if(pgNext && pgNext.firstElementChild) {
            triggerClick(jobClickTarget(pgNext));
        } else {
            // no previous job, try to shift page
            // yep, select case is worse than ifs
            if (direction == DIRECTION.UP) handlePrevPage();
            if (direction == DIRECTION.DOWN) handleNextPage();
        }
    }

    function goToPrevious() {
        shiftWorkPage(DIRECTION.UP)
    }

    function goToNext() {
        shiftWorkPage(DIRECTION.DOWN)
    }


    function triggerClick (node) {
        triggerMouseEvent (node, "mouseover");
        triggerMouseEvent (node, "mousedown");
        triggerMouseEvent (node, "mouseup");
        triggerMouseEvent (node, "click");
    }


    /** Extracts card data from a card */
    function getCompanyNode (node) {
        return node.querySelector(JOB_CARD_COMPANY_NAME_SELECTOR)
    }
    function getPostNode (node) {
        return node.querySelector(JOB_CARD_POST_TITLE_SELECTOR)
    }
    function getCardData (node) {
        var companyUrl, companyName, postUrl, postTitle;
        const company = getCompanyNode(node);
        if(company) {
            companyUrl = company.getAttribute("href").split('?')[0];
            companyName = company.text.trim(" ");
        }

        const post = getPostNode(node);
        if(post) {
            postUrl = post.getAttribute("href").split("/?")[0];
            postTitle = post.text.replace("Promoted","").trim(" \n");
        }
        return {
            companyUrl,
            companyName,
            postUrl,
            postTitle
        };
    }

    /** Add styles to handle hiding */
    GM_addStyle(`.${JOB_SEARCH_RESULTS_FEEDBACK_CLASS} { display: none }`);
    GM_addStyle(".hidden { display: none }");
    GM_addStyle(".read { opacity: 0.3 }");


    console.log("Adding mutation observer");

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = function(mutationsList, observer) {
        // Use traditional 'for loops' for IE 11
        for(let mutation of mutationsList) {
            const target = mutation.target;
            if (mutation.type === 'childList') {
                console.log("Update queued");
                queueUpdate();
            }
            else if (mutation.type === 'attributes') {
                //console.log('The ' + mutation.attributeName + ' attribute was modified.', target);
            }
        }
    };


    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    var $ = window.jQuery;
    waitForKeyElements (JOBS_LIST_SELECTOR, actionFunction);

    function actionFunction (jNode) {
        observer.observe(getJobsList(), config);
    }
}());

