import * as assert from "assert";
import * as bemHelper from "../extension";

suite("Extension Tests", () => {
    // Defines a Mocha unit test
    test("CSS Class extraction - Multiple", () => {
        const html = `
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
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual!.sort(), expected.sort());
    });

    test("CSS Class extraction - Single Quotes", () => {
        const html = `
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
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual!.sort(), expected.sort());
    });

    test("CSS Class extraction - Complex", () => {
        const html = `
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
            "menu__item"
        ];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual!.sort(), expected.sort());
    });

    test("CSS Class extraction - Single", () => {
        const html = `<div class="test-class-one"></div>`;
        const expected = "test-class-one";
        let actual = bemHelper.getClasses(html);
        assert.equal(actual, expected);
    });

    test("CSS Class extraction - None", () => {
        const html = ``;
        const expected: string[] = [];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual!.sort(), expected.sort());
    });

    test("CSS Class extraction - React", () => {
        const html = `<div className="parent-class"><div className="parent-class__child"></div></div>`;
        const expected = ["parent-class", "parent-class__child"];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual!.sort(), expected.sort());
    });

    test("CSS Generation - Single Flat", () => {
        let actual = bemHelper.generateStyleSheet(["test-class"], true);
        let expected = ".test-class{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Multiple Flat", () => {
        let actual = bemHelper.generateStyleSheet(
            ["test-class", "test-class-two", "class-test"],
            true
        );
        let expected = ".class-test{}.test-class{}.test-class-two{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Single Nested", () => {
        let actual = bemHelper.generateStyleSheet(["test-class"], false);
        let expected = ".test-class{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Multiple Nested", () => {
        let actual = bemHelper.generateStyleSheet(
            [
                "test-class",
                "class-test__element",
                "class-test",
                "class-test__element--one",
                "class-test__element--two"
            ],
            false
        );
        let expected = ".class-test{&__element{&--one{}&--two{}}}.test-class{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Modified Blocks Nested", () => {
        let actual = bemHelper.generateStyleSheet(
            ["test-block", "test-block--mod", "test-block--mod-2"],
            false
        );
        let expected = ".test-block{&--mod{}&--mod-2{}}";
        assert.equal(actual, expected);
    });

    test("Class Name Case Matching", () => {
        let pascalClass = "PascalClass__Elem--ModIfier";
        let camelClass = "camelClass__elem--modIfier";
        let kebabClass = "kebab-class__elem--mod-ifier";
        let snakeClass = "snake_class__elem__mod_ifier";
        assert.equal(bemHelper.isCaseMatch(camelClass, "camel"), true);
        assert.equal(bemHelper.isCaseMatch(camelClass, "kebab"), false);
        assert.equal(bemHelper.isCaseMatch(camelClass, "pascal"), false);
        assert.equal(bemHelper.isCaseMatch(camelClass, "snake"), false);
        assert.equal(bemHelper.isCaseMatch(kebabClass, "camel"), false);
        assert.equal(bemHelper.isCaseMatch(kebabClass, "kebab"), true);
        assert.equal(bemHelper.isCaseMatch(kebabClass, "pascal"), false);
        assert.equal(bemHelper.isCaseMatch(kebabClass, "snake"), false);
        assert.equal(bemHelper.isCaseMatch(pascalClass, "camel"), false);
        assert.equal(bemHelper.isCaseMatch(pascalClass, "kebab"), false);
        assert.equal(bemHelper.isCaseMatch(pascalClass, "pascal"), true);
        assert.equal(bemHelper.isCaseMatch(pascalClass, "snake"), false);
        assert.equal(bemHelper.isCaseMatch(snakeClass, "camel"), false);
        assert.equal(bemHelper.isCaseMatch(snakeClass, "kebab"), false);
        assert.equal(bemHelper.isCaseMatch(snakeClass, "pascal"), false);
        assert.equal(bemHelper.isCaseMatch(snakeClass, "snake"), true);
    });
});
