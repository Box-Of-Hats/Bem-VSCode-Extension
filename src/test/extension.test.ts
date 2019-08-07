import * as assert from "assert";
import { BemHelper, ClassNameCases } from "../BemHelper";

suite("BemHelper Tests", () => {
    test("Class extraction - Camel Case", () => {
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
        let bemHelper = new BemHelper();
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual, expected);
    });

    test("Class extraction - Pascal Case", () => {
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
        let bemHelper = new BemHelper();
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual, expected);
    });

    test("Class extraction - Snake Case", () => {
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
        let bemHelper = new BemHelper();
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual, expected);
    });

    test("Class extraction - Kebab Case", () => {
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
        let bemHelper = new BemHelper();
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("Class extraction - Basic", () => {
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
        let bemHelper = new BemHelper();
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("Class extraction - Single Quotes", () => {
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
        let bemHelper = new BemHelper();
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("Class extraction - Backtick", () => {
        const html = `
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
        let bemHelper = new BemHelper();
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("Class extraction - No Classes", () => {
        const html = ``;
        const expected: string[] = [];
        let bemHelper = new BemHelper();
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("Class extraction - React", () => {
        const html = `<div className="parent-class"><div className="parent-class__child"></div></div>`;
        const expected = ["parent-class", "parent-class__child"];
        let bemHelper = new BemHelper();
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("Class extraction - Custom Separators", () => {
        const html = `
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
            "nav-two++modified"
        ];
        let bemHelper = new BemHelper();
        bemHelper.elementSeparator = "~~";
        bemHelper.modifierSeparator = "++";
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("CSS Generation - Single Flat", () => {
        let bemHelper = new BemHelper();
        let actual = bemHelper.generateStyleSheet(["test-class"], true);
        let expected = ".test-class{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Multiple Flat", () => {
        let bemHelper = new BemHelper();
        let actual = bemHelper.generateStyleSheet(
            ["test-class", "test-class-two", "class-test"],
            true
        );
        let expected = ".class-test{}.test-class{}.test-class-two{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Single Nested", () => {
        let bemHelper = new BemHelper();
        let actual = bemHelper.generateStyleSheet(["test-class"], false);
        let expected = ".test-class{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Multiple Nested", () => {
        let bemHelper = new BemHelper();
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
        let bemHelper = new BemHelper();
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
        let bemHelper = new BemHelper();
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
        let bemHelper = new BemHelper();
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
        let bemHelper = new BemHelper();
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
        let bemHelper = new BemHelper();
        let actual = bemHelper.getPrecedingClassName(html, false);
        let expected = "body_class_2";
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
        let bemHelper = new BemHelper();
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
        let bemHelper = new BemHelper();
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
        let bemHelper = new BemHelper();
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
        let bemHelper = new BemHelper();
        let actual = bemHelper.getPrecedingClassName(html, true);
        let expected = "body_class_2__child_1";
        assert.equal(actual, expected);
    });

    test("Get Preceding Class - Block - Single Quote", () => {
        const html = `
            <div class='block'>
                <div class='block__element'>
                </div>
                <div class="block__element block__element--modded">
                </div>
            </div>
        `;
        const bemHelper = new BemHelper();
        let expected = "block";
        let actual = bemHelper.getPrecedingClassName(html, false);
        assert.equal(actual, expected);
    });

    test("Get Preceding Class - Element - Single Quote", () => {
        const html = `
            <div class='block'>
                <div class='block__element'>
                </div>
                <div class="block__element block__element--modded">
                </div>
            </div>
        `;
        const bemHelper = new BemHelper();
        let expected = "block__element";
        let actual = bemHelper.getPrecedingClassName(html, true);
        assert.equal(actual, expected);
    });

    test("Get Preceding Class - Element - Backtick", () => {
        const html = `
            <div class=\`block\`>
                <div class=\`block__element\`>
                </div>
                <div class=\`block__element block__element--modded\`>
                </div>
            </div>
        `;
        const bemHelper = new BemHelper();
        let expected = "block__element";
        let actual = bemHelper.getPrecedingClassName(html, true);
        assert.equal(actual, expected);
    });

    test("Get Preceding Class - Block - Backtick", () => {
        const html = `
            <div class=\`block\`>
                <div class=\`block__element\`>
                </div>
                <div class=\`block__element block__element--modded\`>
                </div>
            </div>
        `;
        const bemHelper = new BemHelper();
        let expected = "block";
        let actual = bemHelper.getPrecedingClassName(html, false);
        assert.equal(actual, expected);
    });

    test("Get Preceding Class - Element - Interpolated String", () => {
        const html = `
            <div class=\`block\`>
                <div class=\`block__element ${true ? "one" : "two"}\`>
                </div>
                <div class=\`block__element block__element--modded ${2}\`>
                </div>
            </div>
        `;
        const bemHelper = new BemHelper();
        let expected = "block__element";
        let actual = bemHelper.getPrecedingClassName(html, true);
        assert.equal(actual, expected);
    });

    test("Get Preceding Class - Block - Interpolated String", () => {
        const html = `
            <div class=\`block\`>
                <div class=\`block__element ${true ? "one" : "two"}\`>
                </div>
                <div class=\`block__element block__element--modded ${2}\`>
                </div>
            </div>
        `;
        const bemHelper = new BemHelper();
        let expected = "block";
        let actual = bemHelper.getPrecedingClassName(html, false);
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Kebab => Snake", () => {
        let inputClassName = "test-class__test-child--modi-fier";
        let expected = "test_class__test_child--modi_fier";
        let bemHelper = new BemHelper();
        let actual = bemHelper.convertClass(
            inputClassName,
            ClassNameCases.Snake
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Kebab => Pascal", () => {
        let inputClassName = "test-class__test-child--modi-fier";
        let expected = "TestClass__TestChild--ModiFier";
        let bemHelper = new BemHelper();
        let actual = bemHelper.convertClass(
            inputClassName,
            ClassNameCases.Pascal
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Kebab => Camel", () => {
        let inputClassName = "test-class__test-child--modi-fier";
        let expected = "testClass__testChild--modiFier";
        let bemHelper = new BemHelper();
        let actual = bemHelper.convertClass(
            inputClassName,
            ClassNameCases.Camel
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Snake => Kebab", () => {
        let inputClassName = "test_class__test_child--modi_fier";
        let expected = "test-class__test-child--modi-fier";
        let bemHelper = new BemHelper();
        let actual = bemHelper.convertClass(
            inputClassName,

            ClassNameCases.Kebab
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Snake => Pascal", () => {
        let inputClassName = "test_class__test_child--modi_fier";
        let expected = "TestClass__TestChild--ModiFier";
        let bemHelper = new BemHelper();
        let actual = bemHelper.convertClass(
            inputClassName,

            ClassNameCases.Pascal
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Snake => Camel", () => {
        let inputClassName = "test_class__test_child--modi_fier";
        let expected = "testClass__testChild--modiFier";
        let bemHelper = new BemHelper();
        let actual = bemHelper.convertClass(
            inputClassName,

            ClassNameCases.Camel
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Camel => Kebab", () => {
        let inputClassName = "testClass__testChild--modiFier";
        let expected = "test-class__test-child--modi-fier";
        let bemHelper = new BemHelper();
        let actual = bemHelper.convertClass(
            inputClassName,

            ClassNameCases.Kebab
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Camel => Snake", () => {
        let inputClassName = "testClass__testChild--modiFier";
        let expected = "test_class__test_child--modi_fier";
        let bemHelper = new BemHelper();
        let actual = bemHelper.convertClass(
            inputClassName,

            ClassNameCases.Snake
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Camel => Pascal", () => {
        let inputClassName = "testClass__testChild--modiFier";
        let expected = "TestClass__TestChild--ModiFier";
        let bemHelper = new BemHelper();
        let actual = bemHelper.convertClass(
            inputClassName,

            ClassNameCases.Pascal
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Pascal => Kebab", () => {
        let inputClassName = "TestClass__TestChild--ModiFier";
        let expected = "test-class__test-child--modi-fier";
        let bemHelper = new BemHelper();
        let actual = bemHelper.convertClass(
            inputClassName,

            ClassNameCases.Kebab
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Pascal => Camel", () => {
        let inputClassName = "TestClass__TestChild--ModiFier";
        let expected = "testClass__testChild--modiFier";
        let bemHelper = new BemHelper();
        let actual = bemHelper.convertClass(
            inputClassName,

            ClassNameCases.Camel
        );
        assert.equal(actual, expected);
    });

    test("Convert Class - Block Element Modifier - Pascal => Snake", () => {
        let inputClassName = "TestClass__testChild--modiFier";
        let expected = "test_class__test_child--modi_fier";
        let bemHelper = new BemHelper();
        let actual = bemHelper.convertClass(
            inputClassName,
            ClassNameCases.Snake
        );
        assert.equal(actual, expected);
    });

    test("Is Case Match - All Cases", () => {
        let pascalClass = "PascalClass__Elem--ModIfier";
        let camelClass = "camelClass__elem--modIfier";
        let kebabClass = "kebab-class__elem--mod-ifier";
        let snakeClass = "snake_class__elem__mod_ifier";
        let bemHelper = new BemHelper();

        let snakeCase = ClassNameCases.Snake;
        let kebabCase = ClassNameCases.Kebab;
        let pascalCase = ClassNameCases.Pascal;
        let camelCase = ClassNameCases.Camel;

        assert.equal(bemHelper.isCaseMatch(camelClass, camelCase), true);
        assert.equal(bemHelper.isCaseMatch(camelClass, kebabCase), false);
        assert.equal(bemHelper.isCaseMatch(camelClass, pascalCase), false);
        assert.equal(bemHelper.isCaseMatch(camelClass, snakeCase), false);
        assert.equal(bemHelper.isCaseMatch(kebabClass, camelCase), false);
        assert.equal(bemHelper.isCaseMatch(kebabClass, kebabCase), true);
        assert.equal(bemHelper.isCaseMatch(kebabClass, pascalCase), false);
        assert.equal(bemHelper.isCaseMatch(kebabClass, snakeCase), false);
        assert.equal(bemHelper.isCaseMatch(pascalClass, camelCase), false);
        assert.equal(bemHelper.isCaseMatch(pascalClass, kebabCase), false);
        assert.equal(bemHelper.isCaseMatch(pascalClass, pascalCase), true);
        assert.equal(bemHelper.isCaseMatch(pascalClass, snakeCase), false);
        assert.equal(bemHelper.isCaseMatch(snakeClass, camelCase), false);
        assert.equal(bemHelper.isCaseMatch(snakeClass, kebabCase), false);
        assert.equal(bemHelper.isCaseMatch(snakeClass, pascalCase), false);
        assert.equal(bemHelper.isCaseMatch(snakeClass, snakeCase), true);
    });
});
