///<reference path="../common/dictionaryEntry.ts" />
///<reference path="../pageStats/pageStats.ts" />

/**
 * Class responsible for generating page stats info (displayed in the right bottom corner).
 *
 * There's no spec for this class: it's pure presentation. It is tested by end-to-end tests.
 */
class PageStatsInfoGenerator {
    /**
     * Generate HTML showing stats about words found on the page.
     * @param stats Page stats.
     */
    generate(stats: PageStats): HTMLElement {
        let html = `<div id="word-highlighter-page-stats">
                        ${this.generateCloseButton()}
                        ${this.generateAggregates(stats)}
                        ${this.generatePerWordDetails(stats)}
                        ${this.generateTip()}
                    </div>`;
        let result = document.createElement('div');
        result.innerHTML = html;
        return result;
    }

    private generatePerWordDetails(stats: PageStats): string {
        return (
            '<div id="word-highlighter-per-word-stats">' +
            stats.wordAppearanceStats
                .sort((a1, a2) => {
                    return a2.count - a1.count;
                })
                .reduce((acc, wordStats) => {
                    let res =
                        acc +
                        `<div>
                                <div class="word-highlighter-per-word-stats-value">${wordStats.dictionaryEntry.value}</div>
                                <div class="word-highlighter-per-word-stats-count">${wordStats.count}</div>
                               </div>`;
                    return res;
                }, '') +
            '</div>'
        );
    }

    private generateAggregates(stats: PageStats): string {
        return `<div>
                    <p class="word-highlighter-page-stats-header">
                        Highlighted
                    </p>
                    <p>
                        <a>
                            <span class="word-highlighter-stats-aggregate">
                                ${stats.totalAppearedWords}
                            </span>
                            words
                        </a>
                    </p>
                    <p>
                        <a>
                            <span class="word-highlighter-stats-aggregate">
                                ${stats.totalAppearances}
                            </span>
                            times
                        </a>
                    </p>
                </div>`;
    }

    private generateCloseButton(): string {
        return '<span id="word-highlighter-page-stats-close">x</span>';
    }

    // Encourage users who find the popup annoying to disable the feature rather than uninstall the plugin altogether.
    private generateTip(): string {
        return '<div id="word-highlighter-page-stats-tip">Tip: you can disable this popup in settings.</div>';
    }
}
