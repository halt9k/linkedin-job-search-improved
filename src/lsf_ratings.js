LSF.addScore = function(a_weight, a_words, a_fuzzy) {
	return {weight: a_weight, words: a_words, fuzzy: a_fuzzy};
};

LSF.SCORING = [
	LSF.addScore(5, ['software developer'], true),
	LSF.addScore(3, ['cpp', 'python'], false),
	LSF.addScore(-10, ['machine learning', 'security clearance'], true),
];

LSF.prototype.calcScores = function() {
	let desc = document.querySelector(LSF.SELECTORS.DETAIL_DESC);

	let score = 0;
	let text = desc.textContent;

	for (let entry of LSF.SCORING) {
		for (let pattern of entry.words) {
			// pattern.pattern()
			if (this.fuzzy_match(text, pattern))
				score += entry.weight;
			console.log(pattern, entry.weight);
		}
	}

};

