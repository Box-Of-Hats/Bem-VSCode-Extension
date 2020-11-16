import * as assert from "assert";
import { BemHelper } from "../../BemHelper";
import { RazorLanguageProvider } from "../../languageProviders";

suite("Razor Language Provider", () => {
	test("ignore list", () => {
		const bemHelper = new BemHelper();
		bemHelper.registerLanguageProvider(new RazorLanguageProvider(), false);

		const html = /*razor*/ `
			<div class="state @(someCount > 0 ? "active" : null)"></div>
			<div class="state @(someCount > 0 ? "active" : null) another-class"></div>
			<div class="state @variable"></div>
			<div class="camelCaseClassName @variable"></div>
			<div class="class-with-variable class-with-variable-@(variable.Something)"></div>
			<div class="test-div-name">Title</div>
		`;

		const actual = bemHelper.getClasses(html, "aspnetcorerazor");
		const expected = [
			"state",
			"another-class",
			"camelCaseClassName",
			"class-with-variable",
			"test-div-name",
		];

		assert.deepStrictEqual(
			actual,
			expected,
			"Class list did not match expected"
		);
	});
});
