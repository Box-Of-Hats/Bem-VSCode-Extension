import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.insertBemModifier", () => {
            let textEditor = vscode.window.activeTextEditor;

            if (textEditor == undefined) {
                vscode.window.showErrorMessage('Text editor was null.');
                return
            }
            let cursorPosition = textEditor.selection.active;

            let precedingText = textEditor.document.getText(
                new vscode.Range(
                    0,
                    0,
                    cursorPosition.line,
                    cursorPosition.character
                )
            );

            var matches = precedingText.match(/class="([a-zA-Z0-9-_]+ ?)+"/g);

            if (matches == null) {
                vscode.window.showErrorMessage('Could not find any classes.');
                return
            }

            var lastMatch: string = matches[matches.length - 1];

            var classNameMatches = lastMatch.match(/"(.*)"/);

            if (classNameMatches == null) {
                vscode.window.showErrorMessage('Could not find any classnames.');
                return
            }
            var className = classNameMatches[classNameMatches.length - 1];

            var outputText = `<div class="${className}--"></div>`;

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
        }));


    context.subscriptions.push(
        vscode.commands.registerCommand("extension.insertBemElement", () => {
            let textEditor = vscode.window.activeTextEditor;

            if (textEditor == undefined) {
                vscode.window.showErrorMessage('Text editor was null.');
                return
            }
            let cursorPosition = textEditor.selection.active;

            let precedingText = textEditor.document.getText(
                new vscode.Range(
                    0,
                    0,
                    cursorPosition.line,
                    cursorPosition.character
                )
            );

            var matches = precedingText.match(/class="([a-zA-Z0-9-_]+ ?)+"/g);

            if (matches == null) {
                vscode.window.showErrorMessage('Could not find any classes.');
                return
            }

            var lastMatch: string = matches[matches.length - 1];

            var classNameMatches = lastMatch.match(/"(.*)"/);

            if (classNameMatches == null) {
                vscode.window.showErrorMessage('Could not find any classnames.');
                return
            }
            var className = classNameMatches[classNameMatches.length - 1];

            var outputText = `<div class="${className}__"></div>`;

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
        }));
}
exports.activate = activate;

function deactivate() { }

module.exports = {
    activate,
    deactivate
};
