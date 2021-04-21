import * as assert from "assert";
import { BemHelper } from "../../BemHelper";
import { TwigLanguageProvider } from "../../languageProviders";

suite("Twig Language Provider", () => {
	test("ignore list", () => {
		const bemHelper = new BemHelper();
		bemHelper.registerLanguageProvider(new TwigLanguageProvider(), false);

		const html = /*twig*/ `
		<img src="{{imgPath}}"logo.svg alt="Logo"></a>
		<ul class="navigation">
			<li class="navigation__item {% if sectionKey == 'home' %}navigation__item--active{% endif %}">
				<a class="navigation__link" href="{{baseUrl}}">Home</a>
			</li>
			<li class="navigation__link {{ var|escape }}">
				<span>Some content</span>
			</li>
		</ul>
		`;

		const actual = bemHelper.getClasses(html, "twig");
		const expected = [
			"navigation",
			"navigation__item",
			"navigation__item--active",
			"navigation__link",
		];

		assert.deepStrictEqual(
			actual,
			expected,
			"Class list did not match expected"
		);
	});
});
