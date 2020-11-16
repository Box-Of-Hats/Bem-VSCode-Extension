import * as assert from "assert";
import { ClassNameCases } from "../../BemHelper";
import { BemDiagnosticProvider } from "../../BemDiagnosticProvider";
import { areSameDiagnostics, newBemHelper } from "./utils";

import * as vscode from "vscode";

suite("BemHelper Tests", () => {
	test("Class extraction - Camel Case", () => {
		const html = /*html*/ `
			<body>
				<div class="navBody">
					<div class="navBody__listItem">One</div>
					<div class="navBody__listItem">Two</div>
					<div class="navBody__listItem--wide">Three</div>
					<div class="navBody__listItem--wide">Four</div>
				</div>
				<div class="navFooter"></div>
			</body>
		`;
		const expected = [
			"navBody",
			"navBody__listItem",
			"navBody__listItem--wide",
			"navFooter",
		];
		let bemHelper = newBemHelper();
		let actual = bemHelper.getClasses(html);
		assert.deepEqual(actual, expected);
	});

	test("Class extraction - Pascal Case", () => {
		const html = /*html*/ `
			<body>
				<div class="NavBody">
					<div class="NavBody__ListItem">One</div>
					<div class="NavBody__ListItem">Two</div>
					<div class="NavBody__ListItem--Wide">Three</div>
					<div class="NavBody__ListItem--Wide">Four</div>
				</div>
				<div class="NavFooter"></div>
			</body>
		`;
		const expected = [
			"NavBody",
			"NavBody__ListItem",
			"NavBody__ListItem--Wide",
			"NavFooter",
		];
		let bemHelper = newBemHelper();
		let actual = bemHelper.getClasses(html);
		assert.deepEqual(actual, expected);
	});

	test("Class extraction - Snake Case", () => {
		const html = /*html*/ `
			<body>
				<div class="nav_body">
					<div class="nav_body__list_item">One</div>
					<div class="nav_body__list_item">Two</div>
					<div class="nav_body__list_item--wide">Three</div>
					<div class="nav_body__list_item--wide">Four</div>
				</div>
				<div class="nav_footer"></div>
			</body>
		`;
		const expected = [
			"nav_body",
			"nav_body__list_item",
			"nav_body__list_item--wide",
			"nav_footer",
		];
		let bemHelper = newBemHelper();
		let actual = bemHelper.getClasses(html);
		assert.deepEqual(actual, expected);
	});

	test("Class extraction - Kebab Case", () => {
		const html = /*html*/ `
			<body>
				<div class="nav">
					<div class="nav__item menu__item">One</div>
					<div class="nav__item">Two</div>
					<div class="nav__item menu__item">Three</div>
					<div class="nav__item nav__item--four">Four</div>
				</div>
				<div class="nav-two">
					<div class="nav-two__item">
						<div class="nav-two__item"></div>
						<div class="nav-two__item nav-two__item--two"></div>
					</div>
				</div>
			</body>
		`;
		const expected = [
			"nav",
			"nav__item",
			"nav__item--four",
			"nav-two",
			"nav-two__item",
			"nav-two__item--two",
			"menu__item",
		];
		let bemHelper = newBemHelper();
		let actual = bemHelper.getClasses(html);
		assert.deepEqual(actual.sort(), expected.sort());
	});

	test("Class extraction - Shouting Snake Case", () => {
		const html = /*html*/ `
			<body>
				<div class="NAV_BODY">
					<div class="NAV_BODY__LIST_ITEM">One</div>
					<div class="NAV_BODY__LIST_ITEM">Two</div>
					<div class="NAV_BODY__LIST_ITEM--WIDE">Three</div>
					<div class="NAV_BODY__LIST_ITEM--WIDE">Four</div>
				</div>
				<div class="NAV_FOOTER"></div>
			</body>
		`;
		const expected = [
			"NAV_BODY",
			"NAV_BODY__LIST_ITEM",
			"NAV_BODY__LIST_ITEM--WIDE",
			"NAV_FOOTER",
		];
		let bemHelper = newBemHelper();
		let actual = bemHelper.getClasses(html);
		assert.deepEqual(actual, expected);
	});

	test("Class extraction - Basic", () => {
		const html = /*html*/ `
			<body>
				<div class="nav">
					<div class="nav__item">One</div>
					<div class="nav__item">Two</div>
					<div class="nav__item">Three</div>
					<div class="nav__item">Four</div>
				</div>
				<div class="nav-two"></div>
			</body>
		`;
		const expected = ["nav", "nav__item", "nav-two"];
		let bemHelper = newBemHelper();
		let actual = bemHelper.getClasses(html);
		assert.deepEqual(actual.sort(), expected.sort());
	});

	test("Class extraction - Single Quotes", () => {
		const html = /*html*/ `
			<body>
				<div class='nav'>
					<div class='nav__item'>One</div>
					<div class='nav__item'>Two</div>
					<div class='nav__item'>Three</div>
					<div class='nav__item'>Four</div>
				</div>
				<div class='nav-two'></div>
			</body>
		`;
		const expected = ["nav", "nav__item", "nav-two"];
		let bemHelper = newBemHelper();
		let actual = bemHelper.getClasses(html);
		assert.deepEqual(actual.sort(), expected.sort());
	});

	test("Class extraction - Backtick", () => {
		const html = /*html*/ `
			<body>
				<div class=\`nav\`>
					<div class=\`nav__item\`>One</div>
					<div class=\`nav__item\`>Two</div>
					<div class=\`nav__item\`>Three</div>
					<div class=\`nav__item\`>Four</div>
				</div>
				<div class=\`nav-two\`></div>
			</body>
		`;
		const expected = ["nav", "nav__item", "nav-two"];
		let bemHelper = newBemHelper();
		let actual = bemHelper.getClasses(html);
		assert.deepEqual(actual.sort(), expected.sort());
	});

	test("Class extraction - No Classes", () => {
		const html = /*html*/ ``;
		const expected: string[] = [];
		let bemHelper = newBemHelper();
		let actual = bemHelper.getClasses(html);
		assert.deepEqual(actual.sort(), expected.sort());
	});

	test("Class extraction - React", () => {
		const html = /*html*/ `<div className="parent-class"><div className="parent-class__child"></div></div>`;
		const expected = ["parent-class", "parent-class__child"];
		let bemHelper = newBemHelper();
		let actual = bemHelper.getClasses(html, "javascriptreact");
		assert.deepEqual(actual.sort(), expected.sort());
	});

	test("Class extraction - Custom Separators - '~~' separator | '++' modifier", () => {
		const html = /*html*/ `
			<body>
				<div class="nav">
					<div class="nav~~item">One</div>
					<div class="nav~~item">Two</div>
					<div class="nav~~item">Three</div>
					<div class="nav~~item">Four</div>
					<div class="nav~~item nav~~item++mod1">Four</div>
					<div class="nav~~item nav~~item++mod2">Four</div>
				</div>
				<div class="nav-two"></div>
				<div class="nav-two nav-two++modified"></div>
			</body>
		`;
		const expected = [
			"nav",
			"nav~~item",
			"nav-two",
			"nav~~item++mod2",
			"nav~~item++mod1",
			"nav-two++modified",
		];
		let bemHelper = newBemHelper();
		bemHelper.elementSeparator = "~~";
		bemHelper.modifierSeparator = "++";
		let actual = bemHelper.getClasses(html);
		assert.deepEqual(actual.sort(), expected.sort());
	});

	test("Class extraction - Custom Separators - '__' separator | '_' modifier", () => {
		const html = /*html*/ `
			<body>
				<div class="nav">
					<div class="nav__item">One</div>
					<div class="nav__item">Two</div>
					<div class="nav__item">Three</div>
					<div class="nav__item">Four</div>
					<div class="nav__item nav__item_mod1">Four</div>
					<div class="nav__item nav__item_mod2">Four</div>
				</div>
				<div class="nav-two"></div>
				<div class="nav-two nav-two_modified"></div>
			</body>
		`;
		const expected = [
			"nav",
			"nav__item",
			"nav-two",
			"nav__item_mod2",
			"nav__item_mod1",
			"nav-two_modified",
		];
		let bemHelper = newBemHelper();
		bemHelper.elementSeparator = "__";
		bemHelper.modifierSeparator = "_";
		let actual = bemHelper.getClasses(html);
		assert.deepEqual(actual.sort(), expected.sort());
	});

	test("CSS Generation - Single Flat", () => {
		let bemHelper = newBemHelper();
		let actual = bemHelper.generateStyleSheet(["test-class"], true);
		let expected = ".test-class{}";
		assert.equal(actual, expected);
	});

	test("CSS Generation - Multiple Flat", () => {
		let bemHelper = newBemHelper();
		let actual = bemHelper.generateStyleSheet(
			["test-class", "test-class-two", "class-test"],
			true
		);
		let expected = ".test-class{}.test-class-two{}.class-test{}";
		assert.equal(actual, expected);
	});

	test("CSS Generation - Single Nested", () => {
		let bemHelper = newBemHelper();
		let actual = bemHelper.generateStyleSheet(["test-class"], false);
		let expected = ".test-class{}";
		assert.equal(actual, expected);
	});

	test("CSS Generation - Multiple Nested", () => {
		let bemHelper = newBemHelper();
		let actual = bemHelper.generateStyleSheet(
			[
				"test-class",
				"class-test__element",
				"class-test",
				"class-test__element--one",
				"class-test__element--two",
			],
			false
		);
		let expected = ".test-class{}.class-test{&__element{&--one{}&--two{}}}";
		assert.equal(actual, expected);
	});

	test("CSS Generation - Modified Blocks Nested", () => {
		let bemHelper = newBemHelper();
		let actual = bemHelper.generateStyleSheet(
			["test-block", "test-block--mod", "test-block--mod-2"],
			false
		);
		let expected = ".test-block{&--mod{}&--mod-2{}}";
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Block - Kebab Case", () => {
		let html = `
			<div class="body-class">
				<div class="body-class__child-element"></div>
				<div class="body-class__another-child"></div>
				<div class="body-class__child-element body-class__child-element--modified"></div>
			</div>
			<div class="body-class-2">
				<div class="body-class-2__child-1"></div>
		`;
		let bemHelper = newBemHelper();
		let actual = bemHelper.getPrecedingClassName(html, false);
		let expected = "body-class-2";
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Block - Camel Case", () => {
		let html = `
			<div class="bodyClass">
				<div class="bodyClass__childElement"></div>
				<div class="bodyClass__anotherChild"></div>
				<div class="bodyClass__childElement bodyClass__childElement--modified"></div>
			</div>
			<div class="bodyClass-2">
				<div class="bodyClass-2__child-1"></div>
		`;
		let bemHelper = newBemHelper();
		let actual = bemHelper.getPrecedingClassName(html, false);
		let expected = "bodyClass-2";
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Block - Pascal Case", () => {
		let html = `
			<div class="BodyClass">
				<div class="BodyClass__ChildElement"></div>
				<div class="BodyClass__AnotherChild"></div>
			</div>
			<div class="BodyClass-2">
					<div class="BodyClass-2__Child-1"></div>
			`;
		let bemHelper = newBemHelper();
		let actual = bemHelper.getPrecedingClassName(html, false);
		let expected = "BodyClass-2";
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Block - Snake Case", () => {
		let html = `
			<div class="body_class">
				<div class="body_class__child_element"></div>
				<div class="body_class__another_child"></div>
				<div
					class="body_class__child_element body_class__child_element--modified"
				></div>
			</div>
			<div class="body_class_2">
				<div class="body_class_2__child_1"></div>
		`;
		let bemHelper = newBemHelper();
		let actual = bemHelper.getPrecedingClassName(html, false);
		let expected = "body_class_2";
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Block - Shouting Snake Case", () => {
		let html = `
			<div class="BODY_CLASS">
				<div class="BODY_CLASS__CHILD_ELEMENT"></div>
				<div class="BODY_CLASS__ANOTHER_CHILD"></div>
				<div
					class="BODY_CLASS__CHILD_ELEMENT BODY_CLASS__CHILD_ELEMENT--MODIFIED"
				></div>
			</div>
			<div class="BODY_CLASS_2">
				<div class="BODY_CLASS_2__CHILD_1"></div>
		`;
		let bemHelper = newBemHelper();
		let actual = bemHelper.getPrecedingClassName(html, false);
		let expected = "BODY_CLASS_2";
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Element - Kebab Case", () => {
		let html = `
			<div class="body-class">
				<div class="body-class__child-element"></div>
				<div class="body-class__another-child"></div>
				<div class="body-class__child-element body-class__child-element--modified"></div>
			</div>
			<div class="body-class-2">
				<div class="body-class-2__child-1"></div>
		`;
		let bemHelper = newBemHelper();
		let actual = bemHelper.getPrecedingClassName(html, true);
		let expected = "body-class-2__child-1";
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Element - Camel Case", () => {
		let html = `
			<div class="bodyClass">
				<div class="bodyClass__childElement"></div>
				<div class="bodyClass__anotherChild"></div>
				<div class="bodyClass__childElement bodyClass__childElement--modified"></div>
			</div>
			<div class="bodyClass-2">
				<div class="bodyClass-2__child-1"></div>
		`;
		let bemHelper = newBemHelper();
		let actual = bemHelper.getPrecedingClassName(html, true);
		let expected = "bodyClass-2__child-1";
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Element - Pascal Case", () => {
		let html = `
			<div class="BodyClass">
				<div class="BodyClass__ChildElement"></div>
				<div class="BodyClass__AnotherChild"></div>
			</div>
			<div class="BodyClass-2">
					<div class="BodyClass-2__Child-1"></div>
			`;
		let bemHelper = newBemHelper();
		let actual = bemHelper.getPrecedingClassName(html, true);
		let expected = "BodyClass-2__Child-1";
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Element - Snake Case", () => {
		let html = `
			<div class="body_class">
				<div class="body_class__child_element"></div>
				<div class="body_class__another_child"></div>
				<div
					class="body_class__child_element body_class__child_element--modified"
				></div>
			</div>
			<div class="body_class_2">
				<div class="body_class_2__child_1"></div>
		`;
		let bemHelper = newBemHelper();
		let actual = bemHelper.getPrecedingClassName(html, true);
		let expected = "body_class_2__child_1";
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Element - Shouting Snake Case", () => {
		let html = `
			<div class="BODY_CLASS">
				<div class="BODY_CLASS__CHILD_ELEMENT"></div>
				<div class="BODY_CLASS__ANOTHER_CHILD"></div>
				<div
					class="BODY_CLASS__CHILD_ELEMENT BODY_CLASS__CHILD_ELEMENT--MODIFIED"
				></div>
			</div>
			<div class="BODY_CLASS_2">
				<div class="BODY_CLASS_2__CHILD_1"></div>
		`;
		let bemHelper = newBemHelper();
		let actual = bemHelper.getPrecedingClassName(html, true);
		let expected = "BODY_CLASS_2__CHILD_1";
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Block - Single Quote", () => {
		const html = /*html*/ `
			<div class='block'>
				<div class='block__element'>
				</div>
				<div class="block__element block__element--modded">
				</div>
			</div>
		`;
		const bemHelper = newBemHelper();
		let expected = "block";
		let actual = bemHelper.getPrecedingClassName(html, false);
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Element - Single Quote", () => {
		const html = /*html*/ `
			<div class='block'>
				<div class='block__element'>
				</div>
				<div class="block__element block__element--modded">
				</div>
			</div>
		`;
		const bemHelper = newBemHelper();
		let expected = "block__element";
		let actual = bemHelper.getPrecedingClassName(html, true);
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Element - Backtick", () => {
		const html = /*html*/ `
			<div class=\`block\`>
				<div class=\`block__element\`>
				</div>
				<div class=\`block__element block__element--modded\`>
				</div>
			</div>
		`;
		const bemHelper = newBemHelper();
		let expected = "block__element";
		let actual = bemHelper.getPrecedingClassName(html, true);
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Block - Backtick", () => {
		const html = /*html*/ `
			<div class=\`block\`>
				<div class=\`block__element\`>
				</div>
				<div class=\`block__element block__element--modded\`>
				</div>
			</div>
		`;
		const bemHelper = newBemHelper();
		let expected = "block";
		let actual = bemHelper.getPrecedingClassName(html, false);
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Block - Vue class after css class", () => {
		let html = `
			<div class="nav-bar" :class="{'is-hidden':isHidden}"></div>
		`;
		let bemHelper = newBemHelper();
		let actual = bemHelper.getPrecedingClassName(html, false);
		let expected = "nav-bar";
		assert.equal(actual, expected);
	});

	test("Get Preceding Class - Block - Vue class before css class", () => {
		let html = `
			<div :class="{'is-hidden':isHidden}" class="nav-bar" ></div>
		`;
		let bemHelper = newBemHelper();
		let actual = bemHelper.getPrecedingClassName(html, false);
		let expected = "nav-bar";
		assert.equal(actual, expected);
	});

	test("Get preceding class - With ignored parent classes", () => {
		const html = /*html*/ `
			<div class="parent-class">
				<i class="material-icons">account_balance</i>
		`;
		const bemHelper = newBemHelper();
		bemHelper.ignoredParentClasses = ["material-icons"];
		const actual = bemHelper.getPrecedingClassName(html, false);
		const expected = "parent-class";
		assert.strictEqual(actual, expected);
	});

	test("Get preceding class - first-parent - Implicit block ", () => {
		const html = /*html*/ `
			<div class="parent-class__child-1">
		`;
		const bemHelper = newBemHelper();

		const expected = "parent-class";

		const actual = bemHelper.getPrecedingClassName(
			html,
			false,
			"first-parent",
			false
		);
		assert.strictEqual(actual, expected);
	});

	test("Get preceding class - first-parent - Explicit block ", () => {
		const html = /*html*/ `
			<div class="parent-class">
		`;
		const bemHelper = newBemHelper();

		const expected = "parent-class";

		const actual = bemHelper.getPrecedingClassName(
			html,
			false,
			"first-parent",
			false
		);
		assert.strictEqual(actual, expected);
	});

	test("Get preceding class - first-parent - Take first parent when given multiple parents ", () => {
		const html = /*html*/ `
		<div class="parent-class-1">
			<div class="parent-class-2__child-1">
		`;
		const bemHelper = newBemHelper();

		const expected = "parent-class-2";

		const actual = bemHelper.getPrecedingClassName(
			html,
			false,
			"first-parent",
			false
		);
		assert.strictEqual(actual, expected);
	});

	test("Get preceding class - explicit-only - Ignore implicit block ", () => {
		const html = /*html*/ `<div class="parent-class__child-1">`;
		const bemHelper = newBemHelper();

		const expected = undefined;

		const actual = bemHelper.getPrecedingClassName(
			html,
			false,
			"explicit-only",
			false
		);
		assert.strictEqual(actual, expected);
	});

	test("Get preceding class - explicit-only - Explicit block ", () => {
		const html = /*html*/ `
			<div class="parent-class">
				<div class="parent-class__child-1">
		`;
		const bemHelper = newBemHelper();

		const expected = "parent-class";

		const actual = bemHelper.getPrecedingClassName(
			html,
			false,
			"explicit-only",
			false
		);
		assert.strictEqual(actual, expected);
	});

	test("Get preceding class - prefer-explicit - With explicit block and implicit block", () => {
		const html = /*html*/ `
			<div class="parent-class-explicit">
				<div class="parent-class-implicit__child-1">
		`;
		const bemHelper = newBemHelper();

		const expected = "parent-class-explicit";

		const actual = bemHelper.getPrecedingClassName(
			html,
			false,
			"prefer-explicit",
			false
		);
		assert.strictEqual(actual, expected);
	});

	test("Get preceding class - prefer-explicit - With implicit block only", () => {
		const html = /*html*/ `
			<div class="parent-class__child-1">
		`;
		const bemHelper = newBemHelper();

		const expected = "parent-class";

		const actual = bemHelper.getPrecedingClassName(
			html,
			false,
			"prefer-explicit",
			false
		);
		assert.strictEqual(actual, expected);
	});

	test("Get preceding class - prefer-explicit - With explicit only", () => {
		const html = /*html*/ `
			<div class="parent-class">
		`;
		const bemHelper = newBemHelper();

		const expected = "parent-class";

		const actual = bemHelper.getPrecedingClassName(
			html,
			false,
			"prefer-explicit",
			false
		);
		assert.strictEqual(actual, expected);
	});

	test("Get preceding class - first-parent - with ignore list", () => {
		const html = /*html*/ `
		<div class="parent-class">
			<div class="ignored-class"></div>
		`;
		const bemHelper = newBemHelper();
		bemHelper.ignoredParentClasses = ["ignored-class"];
		const actual = bemHelper.getPrecedingClassName(
			html,
			false,
			"first-parent"
		);
		const expected = "parent-class";

		assert.strictEqual(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Kebab => Snake", () => {
		let inputClassName = "test-class__test-child--modi-fier";
		let expected = "test_class__test_child--modi_fier";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,
			ClassNameCases.Snake
		);
		assert.equal(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Kebab => Pascal", () => {
		let inputClassName = "test-class__test-child--modi-fier";
		let expected = "TestClass__TestChild--ModiFier";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,
			ClassNameCases.Pascal
		);
		assert.equal(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Kebab => Camel", () => {
		let inputClassName = "test-class__test-child--modi-fier";
		let expected = "testClass__testChild--modiFier";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,
			ClassNameCases.Camel
		);
		assert.equal(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Kebab => Shouting Snake", () => {
		let inputClassName = "test-class__test-child--modi-fier";
		let expected = "TEST_CLASS__TEST_CHILD--MODI_FIER";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,
			ClassNameCases.ShoutingSnake
		);
		assert.equal(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Snake => Kebab", () => {
		let inputClassName = "test_class__test_child--modi_fier";
		let expected = "test-class__test-child--modi-fier";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,

			ClassNameCases.Kebab
		);
		assert.equal(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Snake => Pascal", () => {
		let inputClassName = "test_class__test_child--modi_fier";
		let expected = "TestClass__TestChild--ModiFier";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,
			ClassNameCases.Pascal
		);
		assert.equal(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Snake => Camel", () => {
		let inputClassName = "test_class__test_child--modi_fier";
		let expected = "testClass__testChild--modiFier";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,
			ClassNameCases.Camel
		);
		assert.equal(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Snake => Shouting Snake", () => {
		let inputClassName = "test_class__test_child--modi_fier";
		let expected = "TEST_CLASS__TEST_CHILD--MODI_FIER";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,
			ClassNameCases.ShoutingSnake
		);
		assert.equal(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Camel => Kebab", () => {
		let inputClassName = "testClass__testChild--modiFier";
		let expected = "test-class__test-child--modi-fier";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,

			ClassNameCases.Kebab
		);
		assert.equal(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Camel => Snake", () => {
		let inputClassName = "testClass__testChild--modiFier";
		let expected = "test_class__test_child--modi_fier";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,

			ClassNameCases.Snake
		);
		assert.equal(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Camel => Pascal", () => {
		let inputClassName = "testClass__testChild--modiFier";
		let expected = "TestClass__TestChild--ModiFier";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,
			ClassNameCases.Pascal
		);
		assert.equal(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Camel => Shouting Snake", () => {
		let inputClassName = "testClass__testChild--modiFier";
		let expected = "TEST_CLASS__TEST_CHILD--MODI_FIER";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,
			ClassNameCases.ShoutingSnake
		);
		assert.equal(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Pascal => Kebab", () => {
		let inputClassName = "TestClass__TestChild--ModiFier";
		let expected = "test-class__test-child--modi-fier";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,

			ClassNameCases.Kebab
		);
		assert.equal(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Pascal => Camel", () => {
		let inputClassName = "TestClass__TestChild--ModiFier";
		let expected = "testClass__testChild--modiFier";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,

			ClassNameCases.Camel
		);
		assert.equal(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Pascal => Snake", () => {
		let inputClassName = "TestClass__testChild--modiFier";
		let expected = "test_class__test_child--modi_fier";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,
			ClassNameCases.Snake
		);
		assert.equal(actual, expected);
	});

	test("Convert Class - Block Element Modifier - Pascal => Shouting Snake", () => {
		let inputClassName = "TestClass__TestChild--ModiFier";
		let expected = "TEST_CLASS__TEST_CHILD--MODI_FIER";
		let bemHelper = newBemHelper();
		let actual = bemHelper.convertClass(
			inputClassName,
			ClassNameCases.ShoutingSnake
		);
		assert.equal(actual, expected);
	});

	test("Is Case Match - All Cases", () => {
		const pascalClass = "PascalClass__Elem--ModIfier";
		const camelClass = "camelClass__elem--modIfier";
		const kebabClass = "kebab-class__elem--mod-ifier";
		const snakeClass = "snake_class__elem__mod_ifier";
		const shoutingSnakeClass = "SNAKE_CLASS__ELEM__MOD_IFIER";

		let bemHelper = newBemHelper();

		const snakeCase = ClassNameCases.Snake;
		const kebabCase = ClassNameCases.Kebab;
		const pascalCase = ClassNameCases.Pascal;
		const camelCase = ClassNameCases.Camel;
		const shoutingSnakeCase = ClassNameCases.ShoutingSnake;

		assert.equal(bemHelper.isCaseMatch(camelClass, camelCase), true);
		assert.equal(bemHelper.isCaseMatch(camelClass, kebabCase), false);
		assert.equal(bemHelper.isCaseMatch(camelClass, pascalCase), false);
		assert.equal(bemHelper.isCaseMatch(camelClass, snakeCase), false);
		assert.equal(
			bemHelper.isCaseMatch(camelCase, shoutingSnakeCase),
			false
		);

		assert.equal(bemHelper.isCaseMatch(kebabClass, camelCase), false);
		assert.equal(bemHelper.isCaseMatch(kebabClass, kebabCase), true);
		assert.equal(bemHelper.isCaseMatch(kebabClass, pascalCase), false);
		assert.equal(bemHelper.isCaseMatch(kebabClass, snakeCase), false);
		assert.equal(
			bemHelper.isCaseMatch(kebabCase, shoutingSnakeCase),
			false
		);

		assert.equal(bemHelper.isCaseMatch(pascalClass, camelCase), false);
		assert.equal(bemHelper.isCaseMatch(pascalClass, kebabCase), false);
		assert.equal(bemHelper.isCaseMatch(pascalClass, pascalCase), true);
		assert.equal(bemHelper.isCaseMatch(pascalClass, snakeCase), false);
		assert.equal(
			bemHelper.isCaseMatch(pascalCase, shoutingSnakeCase),
			false
		);

		assert.equal(bemHelper.isCaseMatch(snakeClass, camelCase), false);
		assert.equal(bemHelper.isCaseMatch(snakeClass, kebabCase), false);
		assert.equal(bemHelper.isCaseMatch(snakeClass, pascalCase), false);
		assert.equal(bemHelper.isCaseMatch(snakeClass, snakeCase), true);
		assert.equal(
			bemHelper.isCaseMatch(snakeClass, shoutingSnakeCase),
			false
		);

		assert.equal(
			bemHelper.isCaseMatch(shoutingSnakeClass, shoutingSnakeCase),
			true
		);
		assert.equal(
			bemHelper.isCaseMatch(shoutingSnakeClass, camelCase),
			false
		);
		assert.equal(
			bemHelper.isCaseMatch(shoutingSnakeClass, kebabCase),
			false
		);
		assert.equal(
			bemHelper.isCaseMatch(shoutingSnakeClass, pascalCase),
			false
		);
		assert.equal(
			bemHelper.isCaseMatch(shoutingSnakeClass, snakeCase),
			false
		);
	});

	test("Is Case Match - Custom Separater", () => {
		let bemHelper = newBemHelper();
		bemHelper.modifierSeparator = "_";
		bemHelper.elementSeparator = "__";

		const kebabClass = "myclass__element_modifier";

		assert.equal(
			bemHelper.isCaseMatch(kebabClass, ClassNameCases.Kebab),
			true
		);
	});
});

suite("Integration tests", () => {
	test("Get Diagnostics - Classname cases - Single html class in wrong casing", async () => {
		const bemHelper = newBemHelper();
		const diagnosticProvider = new BemDiagnosticProvider(bemHelper);

		const html = /*html*/ `<body><div class="navBody"></div></body>`;

		const document = await vscode.workspace.openTextDocument({
			language: "html",
			content: html,
		});

		const activeEditor = await vscode.window.showTextDocument(document);

		const actual = diagnosticProvider.getClassNameCaseProblems(
			html,
			activeEditor!,
			[ClassNameCases.Kebab],
			100
		);

		const expected: vscode.Diagnostic[] = [
			new vscode.Diagnostic(
				new vscode.Range(
					new vscode.Position(0, 18),
					new vscode.Position(0, 25)
				),
				"BEM - Class names must be in kebab case",
				vscode.DiagnosticSeverity.Warning
			),
		];

		areSameDiagnostics(actual, expected);
	});

	test("Get Diagnostics - Classname cases - Single html class in correct casing", async () => {
		const bemHelper = newBemHelper();
		const diagnosticProvider = new BemDiagnosticProvider(bemHelper);

		const html = /*html*/ `<body><div class="nav-body"></div></body>`;

		const document = await vscode.workspace.openTextDocument({
			language: "html",
			content: html,
		});

		const activeEditor = await vscode.window.showTextDocument(document);

		const actual = diagnosticProvider.getClassNameCaseProblems(
			html,
			activeEditor!,
			[ClassNameCases.Kebab],
			100
		);

		const expected: vscode.Diagnostic[] = [];

		areSameDiagnostics(actual, expected);
	});

	test("Get Diagnostics - Classname cases - Multiple allowed cases", async () => {
		const bemHelper = newBemHelper();
		const diagnosticProvider = new BemDiagnosticProvider(bemHelper);

		const html = /*html*/ `
		<div className="TopNav">
			<div className="TopNav__button-container"><div>
		</div>
		`;

		const document = await vscode.workspace.openTextDocument({
			language: "html",
			content: html,
		});

		const activeEditor = await vscode.window.showTextDocument(document);

		const actual = diagnosticProvider.getClassNameCaseProblems(
			html,
			activeEditor!,
			[ClassNameCases.Kebab, ClassNameCases.Pascal],
			100
		);

		const expected: vscode.Diagnostic[] = [];

		areSameDiagnostics(actual, expected);
	});
});
