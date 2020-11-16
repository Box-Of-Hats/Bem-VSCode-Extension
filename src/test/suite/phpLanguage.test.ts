import * as assert from "assert";
import { BemHelper } from "../../BemHelper";
import { PhpLanguageProvider } from "../../languageProviders";

suite("PHP language provider tests", () => {
	test("ignore list", () => {
		const bemHelper = new BemHelper();
		bemHelper.registerLanguageProvider(new PhpLanguageProvider(), false);

		const html = /*php*/ `
			<a class="navbar-brand" href="<?php echo esc_url( home_url() ); ?>"></a>
			<a class='second-class <?php echo "test" ?>'></a>
		`;

		const actual = bemHelper.getClasses(html, "php");
		const expected = ["navbar-brand", "second-class"];

		assert.deepStrictEqual(actual, expected);
	});
});
