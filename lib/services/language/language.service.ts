import { Service } from '../services.ts';


export class LanguageService extends Service {
    protected __locale = "en";
    protected __idiom = "english";

    protected __serialization: Record<string, string> = {
        "english": "en",
        "french": "fr",
        "german": "de",
        "italian": "it",
        "spanish": "es",
        "portuguese": "pt",
        "russian": "ru",
        "chinese": "zh",
        "japanese": "ja",
        "korean": "ko",
        "finnish": "fi",
        "danish": "da",
        "swedish": "sv",
        "norwegian": "no",
        "polish": "pl",
        "turkish": "tr",
        "czech": "cs",
        "hungarian": "hu",
        "romanian": "ro",
        "slovak": "sk",
        "slovenian": "sl",
        "ukrainian": "uk",
        "hebrew": "he",
        "arabic": "ar",
        "farsi": "fa",
        "persian": "fa",
        "urdu": "ur",
        "hindi": "hi",
        "bengali": "bn",
        "telugu": "te",
        "tamil": "ta",
        "malayalam": "ml",
        "thai": "th",
        "vietnamese": "vi",
        "indonesian": "id",
        "tagalog": "tl",
        "filipino": "fil",
        "klingon": "tlh",
        "yi": "yi",
        "sorbian": "sb",
        "slovene": "sl",
        "serbian": "sr",
        "bosnian": "bs",
        "croatian": "hr",
    } 

    protected __pathLanguages?: string;

    protected __language = {};

    protected loadLanguage = async () => {
        if (!this.__pathLanguages) throw new Error("Path languages not set");

        this.__language = await import(`${this.__pathLanguages}${this.__locale}.json`);
    }

    public setPathLanguages(path: string) {
        this.__pathLanguages = `${path}/languages/`;
    }

    public setLocale(locale: string) {
        this.__locale = locale;
    }

    public isLocale(locale: string) {
        return this.__locale === locale;
    }

    public useIdiom(idiom: string) {
        this.__idiom = idiom;
        this.__locale = this.__serialization[idiom];
    }

    public language(key: string) {
        const translation = new Function(`language`, `
            return language.${key};
        `);

        return translation(this.__language);
    }

    get currentIdiom() {
        return this.__idiom;
    }

    get currentLocale() {
        return this.__locale;
    }
}

/**
 * list of idioms
 * 
 * spanish = es
 * english = en
 * chiinese = zh
 * japanese = ja
 * 
 */