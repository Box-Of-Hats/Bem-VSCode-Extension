import * as vscode from 'vscode';


function getParentClassName(html: string, matchElements: boolean) {

    var r = matchElements ? /class="([a-zA-Z0-9-_]+ ?)+"/g : /class="([a-zA-Z0-9-]+ ?)+"/g

    var matches = html.match(r);

    if (matches == null) {
        return null
    }

    var lastMatch: string = matches[matches.length - 1];

    var classNameMatches = lastMatch.match(/"(.*)"/);

    if (classNameMatches == null) {
        return null
    }
    return classNameMatches[classNameMatches.length - 1];
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.insertBemModifier", () => {
            let textEditor = vscode.window.activeTextEditor;

            if (textEditor == undefined) {
                vscode.window.showErrorMessage('No active text editor. Please open a file');
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

            var className = getParentClassName(precedingText, true);
            if (className === null) {
                vscode.window.showErrorMessage("Could not find any classes in current file.")
                return
            }

            var outputText = `<div class="${className} ${className}--"></div>`;

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
                vscode.window.showErrorMessage('No active text editor. Please open a file');
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

            var className = getParentClassName(precedingText, false);
            if (className === null) {
                vscode.window.showErrorMessage("Could not find any classes in current file.")
                return
            }

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
