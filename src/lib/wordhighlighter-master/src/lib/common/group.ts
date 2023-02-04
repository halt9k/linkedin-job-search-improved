enum MatchingType {
    STRICT = 'STRICT',
    SMART = 'SMART',
}

/**
 * A persistent group.
 */
class Group {
    public static readonly DEFAULT_GROUP_ID = 1;
    public static readonly DEFAULT_MATCHING_TYPE = MatchingType.SMART;
    public static readonly DEFAULT_MATCHING_LANGUAGE = 'en';

    constructor(
        id: number,
        name: string,
        backgroundColor: string,
        matchingType: MatchingType,
        matchingLanguage: string,
        _blockedWebsites: Array<string> = undefined,
        _allowedWebsites: Array<string> = undefined,
        createdAt: Date = undefined,
        updatedAt: Date = undefined
    ) {
        this._id = id;
        this._name = name;
        this._backgroundColor = backgroundColor;
        this._matchingType = matchingType;
        this._matchingLanguage = matchingLanguage;
        this._blockedWebsites = _blockedWebsites;
        this._allowedWebsites = _allowedWebsites;
        let now = new Date();
        this._createdAt = createdAt || now;
        this._updatedAt = updatedAt || now;
    }

    private _id: number;

    get id(): number {
        return this._id;
    }

    set id(_id: number) {
        this._id = _id;
    }

    private _name: string;

    get name(): string {
        return this._name;
    }

    set name(_name: string) {
        this._name = _name;
    }

    private _backgroundColor: string;

    get backgroundColor(): string {
        return this._backgroundColor;
    }

    set backgroundColor(_backgroundColor: string) {
        this._backgroundColor = _backgroundColor;
    }

    private _matchingType: MatchingType;

    get matchingType(): MatchingType {
        return this._matchingType;
    }

    set matchingType(_matchingType: MatchingType) {
        this._matchingType = _matchingType;
    }

    private _matchingLanguage: string;

    get matchingLanguage(): string {
        return this._matchingLanguage;
    }

    set matchingLanguage(_matchingLanguage: string) {
        this._matchingLanguage = _matchingLanguage;
    }

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

    private _createdAt: Date;

    get createdAt(): Date {
        return this._createdAt;
    }

    private _updatedAt: Date;

    get updatedAt(): Date {
        return this._updatedAt;
    }

    set updatedAt(_updatedAt: Date) {
        this._updatedAt = _updatedAt;
    }
}
