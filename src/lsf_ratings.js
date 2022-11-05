LSF.addScore = function(a_weight, a_words, a_fuzzy) {
	return {weight: a_weight, words: a_words, fuzzy: a_fuzzy};
};

LSF.SCORING = [
	LSF.addScore(5, ['software developer'], true),
	LSF.addScore(3, ['c++', 'python'], false),
	LSF.addScore(-10, ['machine learning', 'security clearance'], true),
];

LSF.prototype.calcScores = function() {
	let desc = document.querySelector(LSF.SELECTORS.DETAIL_DESC);

	let score = 0;
	let text = desc.textContent;

	for (let entry of LSF.SCORING) {
		for (let match of entry.words) {
			// match.match()
			if (this.fuzzy_match(match, text))
				score += entry.weight;
			console.log(match, entry.weight);
		}
	}

};

