import * as assert from "assert";
import * as bemHelper from "../extension";

suite("Extension Tests", () => {
    test("CSS Class extraction - Camel Case", () => {
        const html = `
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
            "navFooter"
        ];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual, expected);
    });

    test("CSS Class extraction - Pascal Case", () => {
        const html = `
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
            "NavFooter"
        ];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual, expected);
    });

    test("CSS Class extraction - Snake Case", () => {
        const html = `
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
            "nav_footer"
        ];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual, expected);
    });

    test("CSS Class extraction - Kebab Case", () => {
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
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("CSS Class extraction - Basic", () => {
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
        assert.deepEqual(actual.sort(), expected.sort());
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
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("CSS Class extraction - No Classes", () => {
        const html = ``;
        const expected: string[] = [];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("CSS Class extraction - React", () => {
        const html = `<div className="parent-class"><div className="parent-class__child"></div></div>`;
        const expected = ["parent-class", "parent-class__child"];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual.sort(), expected.sort());
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

    test("Get Parent Class - Kebab Case (block)", () => {
        let html = `
            <div class="body-class">
                <div class="body-class__child-element"></div>
                <div class="body-class__another-child"></div>
                <div class="body-class__child-element body-class__child-element--modified"></div>
            </div>
            <div class="body-class-2">
                <div class="body-class-2__child-1"></div>
        `;
        let actual = bemHelper.getPrecedingClassName(html, false);
        let expected = "body-class-2";
        assert.equal(actual, expected);
    });

    test("Get Parent Class - Camel Case (block)", () => {
        let html = `
            <div class="bodyClass">
                <div class="bodyClass__childElement"></div>
                <div class="bodyClass__anotherChild"></div>
                <div class="bodyClass__childElement bodyClass__childElement--modified"></div>
            </div>
            <div class="bodyClass-2">
                <div class="bodyClass-2__child-1"></div>
        `;
        let actual = bemHelper.getPrecedingClassName(html, false);
        let expected = "bodyClass-2";
        assert.equal(actual, expected);
    });

    test("Get Parent Class - Pascal Case (block)", () => {
        let html = `
            <div class="BodyClass">
                <div class="BodyClass__ChildElement"></div>
                <div class="BodyClass__AnotherChild"></div>
            </div>
            <div class="BodyClass-2">
                    <div class="BodyClass-2__Child-1"></div>
            `;
        let actual = bemHelper.getPrecedingClassName(html, false);
        let expected = "BodyClass-2";
        assert.equal(actual, expected);
    });

    test("Get Parent Class - Snake Case (block)", () => {
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
        let actual = bemHelper.getPrecedingClassName(html, false);
        let expected = "body_class_2";
        assert.equal(actual, expected);
    });

    test("Get Parent Class - Kebab Case (element)", () => {
        let html = `
            <div class="body-class">
                <div class="body-class__child-element"></div>
                <div class="body-class__another-child"></div>
                <div class="body-class__child-element body-class__child-element--modified"></div>
            </div>
            <div class="body-class-2">
                <div class="body-class-2__child-1"></div>
        `;
        let actual = bemHelper.getPrecedingClassName(html, true);
        let expected = "body-class-2__child-1";
        assert.equal(actual, expected);
    });

    test("Get Parent Class - Camel Case (element)", () => {
        let html = `
            <div class="bodyClass">
                <div class="bodyClass__childElement"></div>
                <div class="bodyClass__anotherChild"></div>
                <div class="bodyClass__childElement bodyClass__childElement--modified"></div>
            </div>
            <div class="bodyClass-2">
                <div class="bodyClass-2__child-1"></div>
        `;
        let actual = bemHelper.getPrecedingClassName(html, true);
        let expected = "bodyClass-2__child-1";
        assert.equal(actual, expected);
    });

    test("Get Parent Class - Pascal Case (element)", () => {
        let html = `
            <div class="BodyClass">
                <div class="BodyClass__ChildElement"></div>
                <div class="BodyClass__AnotherChild"></div>
            </div>
            <div class="BodyClass-2">
                    <div class="BodyClass-2__Child-1"></div>
            `;
        let actual = bemHelper.getPrecedingClassName(html, true);
        let expected = "BodyClass-2__Child-1";
        assert.equal(actual, expected);
    });

    test("Get Parent Class - Snake Case (element)", () => {
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
        let actual = bemHelper.getPrecedingClassName(html, true);
        let expected = "body_class_2__child_1";
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
