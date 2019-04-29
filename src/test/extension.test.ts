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

    test("CSS Generation - Single Flat", () => {
        var actual = bemHelper.generateStyleSheet(["test-class"], true);
        var expected = ".test-class{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Multiple Flat", () => {
        var actual = bemHelper.generateStyleSheet(
            ["test-class", "test-class-two", "class-test"],
            true
        );
        var expected = ".class-test{}.test-class{}.test-class-two{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Single Nested", () => {
        var actual = bemHelper.generateStyleSheet(["test-class"], false);
        var expected = ".test-class{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Multiple Nested", () => {
        var actual = bemHelper.generateStyleSheet(
            [
                "test-class",
                "class-test__element",
                "class-test",
                "class-test__element--one",
                "class-test__element--two"
            ],
            false
        );
        var expected = ".class-test{&__element{&--one{}&--two{}}}.test-class{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Modified Blocks Nested", () => {
        var actual = bemHelper.generateStyleSheet(
            ["test-block", "test-block--mod", "test-block--mod-2"],
            false
        );
        var expected = ".test-block{&--mod{}&--mod-2{}}";
        assert.equal(actual, expected);
    });
});
