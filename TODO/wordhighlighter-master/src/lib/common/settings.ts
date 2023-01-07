/**
 * When to show the tooltip on hovering over highlighted words.
 */
enum ShowTooltip {
    ALWAYS = 'ALWAYS',
    WITH_DESCRIPTION = 'WITH_DESCRIPTION',
    NEVER = 'NEVER',
}

/**
 * Settings.
 */
class Settings {
    public static readonly DEFAULT_TIMEOUT = 3;
    public static readonly DEFAULT_ENABLE_HIGHLIGHTING = true;
    public static readonly DEFAULT_ENABLE_PAGE_STATS = true;
    public static readonly DEFAULT_BACKGROUND_COLOR = 'ffff00';
    public static readonly DEFAULT_LEGACY_BACKGROUND_COLOR: string = undefined;
    public static readonly DEFAULT_SHOW_TOOLTIP = ShowTooltip.WITH_DESCRIPTION;
    public static readonly DEFAULT_BLOCKED_WEBSITES: Array<string> = [];
    public static readonly DEFAULT_ALLOWED_WEBSITES: Array<string> = [];

    public static readonly DEFAULT: Settings = new Settings(
        Settings.DEFAULT_TIMEOUT,
        Settings.DEFAULT_ENABLE_HIGHLIGHTING,
        Settings.DEFAULT_ENABLE_PAGE_STATS,
        Settings.DEFAULT_SHOW_TOOLTIP,
        Settings.DEFAULT_LEGACY_BACKGROUND_COLOR,
        Settings.DEFAULT_BLOCKED_WEBSITES,
        Settings.DEFAULT_ALLOWED_WEBSITES
    );

    constructor(
        _timeout: number = undefined,
        _enableHighlighting: boolean = undefined,
        _enablePageStats: boolean = undefined,
        _showTooltip: ShowTooltip = undefined,
        _legacyBackgroundColor: string = undefined,
        _blockedWebsites: Array<string> = undefined,
        _allowedWebsites: Array<string> = undefined
    ) {
        this._timeout = _timeout;
        this._enableHighlighting = _enableHighlighting;
        this._enablePageStats = _enablePageStats;
        this._showTooltip = _showTooltip;
        this._legacyBackgroundColor = _legacyBackgroundColor;
        this._blockedWebsites = _blockedWebsites;
        this._allowedWebsites = _allowedWebsites;
    }

    private _timeout: number;

    get timeout(): number {
        return this._timeout;
    }

    set timeout(_timeout: number) {
        this._timeout = _timeout;
    }

    private _enableHighlighting: boolean;

    get enableHighlighting(): boolean {
        return this._enableHighlighting;
    }

    set enableHighlighting(_enableHighlighting: boolean) {
        this._enableHighlighting = _enableHighlighting;
    }

    private _enablePageStats: boolean;

    get enablePageStats(): boolean {
        return this._enablePageStats;
    }

    set enablePageStats(_enablePageStats: boolean) {
        this._enablePageStats = _enablePageStats;
    }

    private _showTooltip: ShowTooltip;

    get showTooltip(): ShowTooltip {
        return this._showTooltip;
    }

    set showTooltip(_showTooltip: ShowTooltip) {
        this._showTooltip = _showTooltip;
    }

    private _legacyBackgroundColor: string;

    // Use Group.backgroundColor instead.
    get legacyBackgroundColor(): string {
        return this._legacyBackgroundColor;
    }

    set legacyBackgroundColor(_legacyBackgroundColor: string) {
        this._legacyBackgroundColor = _legacyBackgroundColor;
    }

    // Legacy setting.

    private _blockedWebsites: Array<string>;

    get blockedWebsites(): Array<string> {
        return this._blockedWebsites;
    }

    set blockedWebsites(_blockedWebsites: Array<string>) {
        this._blockedWebsites = _blockedWebsites;
    }

    private _allowedWebsites: Array<string>;

    get allowedWebsites(): Array<string> {
        return this._allowedWebsites;
    }

    set allowedWebsites(_allowedWebsites: Array<string>) {
        this._allowedWebsites = _allowedWebsites;
    }
}
