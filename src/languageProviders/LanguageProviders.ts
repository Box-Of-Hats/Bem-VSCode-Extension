import { LanguageProvider } from "./LanguageProvider";

export class TypescriptReactLanguageProvider implements LanguageProvider {
    language = "typescriptreact";
    classAttributeLabel = "className";
    htmlIgnorePatterns = [/\${.*}/];
}

export class JavascriptReactLanguageProvider implements LanguageProvider {
    language = "javascriptreact";
    classAttributeLabel = "className";
    htmlIgnorePatterns = [/\${.*}/];
}
export class PhpLanguageProvider implements LanguageProvider {
    language = "php";
    classAttributeLabel = "class";
    htmlIgnorePatterns = [/<\?php\s+.*\?>/];
}
