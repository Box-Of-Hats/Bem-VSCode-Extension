// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Use the console to output diagnostic information
    // This line of code will only be executed once when your extension is activated
    console.log("Registered BemFriend");

    //The template of an element
    let divTemplate = `<div class="{0}__"></div>`;

    // Create polyfill for string formatting - https://stackoverflow.com/a/4673436
    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != "undefined"
                    ? args[number]
                    : match;
            });
        };
    }

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand(
        "extension.insertBemChild",
        function() {
            // The code you place here will be executed every time your command is executed

            //Make our lives easier
            let textEditor = vscode.window.activeTextEditor;
            let cursorPosition = textEditor.selection.active;

            let precedingText = textEditor.document.getText(
                new vscode.Range(
                    0,
                    0,
                    cursorPosition.line,
                    cursorPosition.character
                )
            );

            var matches = precedingText.match(/class="([a-zA-Z0-9_]+ ?)+"/g);

            var lastMatch = matches[matches.length - 1];

            var classNameMatches = lastMatch.match(/"(.*)"/);
            var className = classNameMatches[classNameMatches.length - 1];

            var outputText = divTemplate.format(className);

            var myEdit = vscode.TextEdit.insert(cursorPosition, outputText);

            let edit = new vscode.WorkspaceEdit();
            let uri = textEditor.document.uri;

            edit.set(uri, [myEdit]);

            vscode.workspace.applyEdit(edit);

            vscode.commands.executeCommand("");

            vscode.commands
                .executeCommand("cursorMove", { to: "wrappedLineEnd" })
                .then(() => {
                    vscode.commands.executeCommand("cursorMove", {
                        to: "left",
                        by: "character",
                        value: 8
                    });
                })
                .then(() => {
                    vscode.commands.executeCommand(
                        "vscode.executeFormatDocumentProvider"
                    );
                });
        }
    );

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
