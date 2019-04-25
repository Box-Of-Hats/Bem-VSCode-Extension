import * as vscode from 'vscode';


export function getClasses(html: string) {
    let classNames: string[] = [];
    const regex = /class="([a-zA-Z0-9-_ ]+)"/g;
    const classNameRegex = /"(.*)"/;
    let match;
    while (match = regex.exec(html)) {
        var classes = classNameRegex.exec(match[0])[1];
        classes.split(" ").forEach(className => {
            if (classNames.indexOf(className) === -1){
                classNames.push(className);
            }
        });
    }
    return classNames;
}

function getParentClassName(html: string, matchElements: boolean) {

    const regex = matchElements ? /class="([a-zA-Z0-9-_]+ ?)+"/g : /class="([a-zA-Z0-9-]+ ?)+"/g

    var matches = html.match(regex);

    if (matches == null) {
        return null
    }

    var lastMatch = matches[matches.length - 1];

    var classNameMatches = lastMatch.match(/"(.*)"/);

    if (classNameMatches == null) {
        return null
    }
    return classNameMatches[classNameMatches.length - 1];
}

function updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection): void {
    let activeEditor = vscode.window.activeTextEditor;
    const regex = /(class="[a-zA-Z0-9_-]+__[a-zA-Z0-9_-]+__*[a-zA-Z0-9_-]*__*[a-zA-Z0-9_-]*["]*)/g
    const docText = document.getText();
    var editorHighlights = new Array();

    let match;
    while (match = regex.exec(docText)) {
        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(match.index + match[0].length);

        editorHighlights.push({
            code: '',
            message: 'BEM violation - classes must only consist of block and element.',
            range: new vscode.Range(startPos, endPos),
            severity: vscode.DiagnosticSeverity.Warning,
            source: '',
            relatedInformation: [
                new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, new vscode.Range(new vscode.Position(1, 8), new vscode.Position(1, 9))), `${match[0]}`)
            ]
        });
    }

    if (editorHighlights.length > 0) {
        collection.set(document.uri, editorHighlights);
    } else {
        collection.clear();
    }
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

    const collection = vscode.languages.createDiagnosticCollection('BEM');
    if (vscode.window.activeTextEditor) {
        updateDiagnostics(vscode.window.activeTextEditor.document, collection);
    }
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => updateDiagnostics(e.document, collection)));
}
exports.activate = activate;

export function deactivate() { }
