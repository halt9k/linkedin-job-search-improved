// Setup dictionaries to persist useful information across sessions

/* globals LSF, unsafeWindow, console */

LSF.StoredDictionary = class{
	constructor(storageKey) {
		this.storageKey = storageKey;
		this.data = GM_getValue(storageKey) || {};
		console.log('Initial data read from', this.storageKey, this.data);
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

LSF.prototype.createStorage = function() {
	this.hiddenCompanies = new LSF.StoredDictionary('hidden_companies');
	this.hiddenPosts = new LSF.StoredDictionary('hidden_posts');
	this.readPosts = new LSF.StoredDictionary('read_posts');
	this.highlightedWords = new LSF.StoredDictionary('highlighled_words');
}

// Handle requests to print debug information
LSF.prototype.handlePrintDebug = function() {

	const companies = this.hiddenCompanies.getDictionary();
	console.log('Hidden companies', Object.keys(companies).length);
	console.log(companies);

	const posts = this.hiddenPosts.getDictionary();
	console.log('Hidden posts', Object.keys(posts).length);
	console.log(posts);

	const read = this.readPosts.getDictionary();
	console.log('Read posts', Object.keys(read).length);
	console.log(read);
}