export interface LanguageProvider {
	languages: string[];
	classAttributeLabel: string;
	htmlIgnorePatterns: RegExp[];
}

export class HtmlLanguageProvider implements LanguageProvider {
	languages = ["html"];
	classAttributeLabel = "class";
	htmlIgnorePatterns = [];
}

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

export const defaultLanguageProviders = [
	new HtmlLanguageProvider(),
	new RazorLanguageProvider(),
	new JavascriptReactLanguageProvider(),
	new PhpLanguageProvider(),
	new TypescriptReactLanguageProvider(),
];
