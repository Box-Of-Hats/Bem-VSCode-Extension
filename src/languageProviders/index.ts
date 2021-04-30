export interface LanguageProvider {
	/**A list of languages that the provider should be used for	 */
	languages: string[];
	/**The class attribute name to use when inserting new elements	 */
	classAttributeLabel: string;
	/** Regex matching patterns of strings that should be ignored within classes */
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

export class TwigLanguageProvider implements LanguageProvider {
	languages = ["twig"];
	classAttributeLabel = "class";
	htmlIgnorePatterns = [
		/\{\{[\d\w_\-=\s'"`|]*\}\}/g,
		/\{\%[\d\w_\-=\s'"`|]*\%\}/g,
	];
}

export class SvelteLanguageProvider implements LanguageProvider {
	languages = ["svelte"];
	classAttributeLabel = "class";
	htmlIgnorePatterns = [/\{[^{}]*\}/g];
}

export const defaultLanguageProviders = [
	new HtmlLanguageProvider(),
	new RazorLanguageProvider(),
	new JavascriptReactLanguageProvider(),
	new PhpLanguageProvider(),
	new TypescriptReactLanguageProvider(),
	new TwigLanguageProvider(),
	new SvelteLanguageProvider(),
];
