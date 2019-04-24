//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as bemHelper from '../extension';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {

    // Defines a Mocha unit test
    test("CSS Class extraction - Multiple", function () {
        const html = `
            <body>
                <div class="nav">
                    <div class="nav__item">One</div>
                    <div class="nav__item">Two</div>
                    <div class="nav__item">Three</div>
                    <div class="nav__item nav__item--four">Four</div>
                </div>
                <div class="nav-two"></div>
            </body>
        `;
        const expected = ["nav", "nav__item", "nav__item--four", "nav-two"];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual, expected);
    });

    test("CSS Class extraction - Single", function () {
        const html = `<div class="test-class-one"></div>`;
        const expected = "test-class-one";
        let actual = bemHelper.getClasses(html);
        assert.equal(actual, expected)
    });

    test("CSS Class extraction - None", function () {
        const html = ``;
        const expected: string[] = [];
        let actual = bemHelper.getClasses(html);
        assert.deepEqual(actual, expected);
    });
});