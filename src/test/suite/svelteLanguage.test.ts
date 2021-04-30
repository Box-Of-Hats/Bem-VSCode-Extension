import * as assert from "assert";
import { BemHelper } from "../../BemHelper";
import { SvelteLanguageProvider } from "../../languageProviders";

suite("Svelte Language Provider", () => {
	test("ignore list", () => {
		const bemHelper = new BemHelper();
		bemHelper.registerLanguageProvider(new SvelteLanguageProvider(), false);

		const html = /*html*/ `
		<script>
			let current = 'foo';
			const homeUrl = "/home.html"
		</script>

		<style>
			button {
				display: block;
			}

			.selected {
				background-color: #ff3e00;
				color: white;
			}
		</style>

		<ul class="navigation">
			<li class="navigation__item {current === 'foo' ? 'selected' : ''} navigation__item--active">
				<a
				class="navigation__link"
				class:active="navigation__link--active"
				class:hover="navigation__link--hover"
				href="{homeUrl}">Home</a>
			</li>
			<li class="navigation__link">
				<span>Some content</span>
			</li>
		</ul>
		`;

		const actual = bemHelper.getClasses(html, "svelte");
		const expected = [
			"navigation",
			"navigation__item",
			"navigation__item--active",
			"navigation__link",
			"navigation__link--active",
			"navigation__link--hover",
		];

		assert.deepStrictEqual(
			actual,
			expected,
			"Class list did not match expected"
		);
	});
});
