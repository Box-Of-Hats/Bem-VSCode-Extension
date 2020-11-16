export interface ClassNameProvider {
	nameMatchRegex: RegExp;
	name: string;
	convertWordsToClassName: (classWords: string[]) => string;
}

export class KebabCase implements ClassNameProvider {
	nameMatchRegex = /^[a-z0-9-]+$/;
	name = "kebab";
	convertWordsToClassName = (classWords: string[]) => classWords.join("-");
}

export class SnakeCase implements ClassNameProvider {
	nameMatchRegex = /^[a-z0-9_]+$/;
	name = "snake";
	convertWordsToClassName = (classWords: string[]) => classWords.join("_");
}

export class ShoutingSnakeCase implements ClassNameProvider {
	nameMatchRegex = /^[A-Z0-9_]+$/;
	name = "shoutingSnake";
	convertWordsToClassName = (classWords: string[]) =>
		classWords.join("_").toUpperCase();
}

export class CamelCase implements ClassNameProvider {
	nameMatchRegex = /^[a-z]{1}[a-zA-Z0-9]+$/;
	name = "camel";
	convertWordsToClassName = (classWords: string[]) =>
		classWords
			.map((word, index) => {
				if (index === 0) {
					return word;
				}
				return `${word[0].toUpperCase()}${word.slice(1)}`;
			})
			.join("");
}

export class PascalCase implements ClassNameProvider {
	nameMatchRegex = /^[A-Z]{1}[a-zA-Z0-9]+$/;
	name = "pascal";
	convertWordsToClassName = (classWords: string[]) =>
		classWords
			.map((word) => {
				return `${word[0].toUpperCase()}${word.slice(1)}`;
			})
			.join("");
}

export class AnyCase implements ClassNameProvider {
	nameMatchRegex = /.*/;
	name = "any";
	convertWordsToClassName = (classWords: string[]) => classWords.join();
}

export const defaultClassNameProviders = [
	new KebabCase(),
	new SnakeCase(),
	new ShoutingSnakeCase(),
	new CamelCase(),
	new PascalCase(),
	new AnyCase(),
];
