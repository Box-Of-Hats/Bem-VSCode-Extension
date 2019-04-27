//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from "assert";
import * as bemHelper from "../extension";
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function() {
    // Defines a Mocha unit test
    test("CSS Class extraction - Multiple", function() {
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

    test("CSS Class extraction - Complex", function() {
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

    test("CSS Class extraction - Single", function() {
        const html = `<div class="test-class-one"></div>`;
        const expected = "test-class-one";
        let actual = bemHelper.getClasses(html);
        assert.equal(actual, expected);
    });

    test("CSS Class extraction - None", function() {
        const html = ``;
        const expected: string[] = [];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual.sort(), expected.sort());
    });

    test("CSS Generation - Single Flat", function() {
        var actual = bemHelper.generateStyleSheet(["test-class"], true);
        var expected = "test-class{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Multiple Flat", function() {
        var actual = bemHelper.generateStyleSheet(
            ["test-class", "test-class-two", "class-test"],
            true
        );
        var expected = "class-test{}test-class{}test-class-two{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Single Nested", function() {
        var actual = bemHelper.generateStyleSheet(["test-class"], false);
        var expected = "test-class{}";
        assert.equal(actual, expected);
    });

    test("CSS Generation - Multiple Nested", function() {
        var actual = bemHelper.generateStyleSheet(
            ["test-class", "class-test__element", "class-test", "class-test__element--one", "class-test__element--two"],
            false
        );
        var expected = "class-test{&__element{&--one{}&--two{}}}test-class{}";
        assert.equal(actual, expected);
    });
});
