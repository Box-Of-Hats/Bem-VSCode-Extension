const vscode = require("vscode");

function activate(context) {
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

    context.subscriptions.push("extension.insertBemModifier", () => {});

    context.subscriptions.push(
        vscode.commands.registerCommand("extension.insertBemElement", () => {
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

            var matches = precedingText.match(/class="([a-zA-Z0-9-]+ ?)+"/g);

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
                });
        })
    );
}
exports.activate = activate;

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
