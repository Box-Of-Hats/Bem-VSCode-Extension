import { LanguageProvider } from "./LanguageProvider";

export class TypescriptReactLanguageProvider implements LanguageProvider {
    language = "typescriptreact";
    classAttributeLabel = "className";
}

export class JavascriptReactLanguageProvider implements LanguageProvider {
    language = "javascriptreact";
    classAttributeLabel = "className";
}
