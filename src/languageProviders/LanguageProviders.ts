import { LanguageProvider } from "./LanguageProvider";

export class TypescriptReactLanguageProvider implements LanguageProvider {
	languages = ["typescriptreact"];
	classAttributeLabel = "className";
	htmlIgnorePatterns = [/\${.*}/g];
}

export class JavascriptReactLanguageProvider implements LanguageProvider {
	languages = ["javascriptreact"];
	classAttributeLabel = "className";
	htmlIgnorePatterns = [/\${.*}/g];
}

export class PhpLanguageProvider implements LanguageProvider {
	languages = ["php"];
	classAttributeLabel = "class";
	htmlIgnorePatterns = [/<\?php\s+.*\?>/g];
}

export class RazorLanguageProvider implements LanguageProvider {
	languages = ["razor", "cshtml", "aspnetcorerazor"];
	classAttributeLabel = "class";
	htmlIgnorePatterns = [/[\w\d-_]*@((\(.*\))|([\w\d-_]+))[\s]?/g];
}
