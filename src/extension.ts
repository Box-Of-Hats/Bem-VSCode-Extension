import * as vscode from "vscode";

enum ClassNameCases {
    Any = "any",
    Kebab = "kebab",
    Snake = "snake"
}

//#region methods

//Generate a stylesheet from a list of classes.
export function generateStyleSheet(classNames: string[], flat: boolean) {
    let styleSheet = ``;
    let styles = {};
    const _blockModifierName = "__BLOCK__MODIFIER__";

    classNames.sort().forEach(className => {
        if (flat) {
            styleSheet = `${styleSheet}.${className}{}`;
        } else {
            let block = className.split("__")[0].split("--")[0];
            let element = className.split("__")[1]
                ? className.split("__")[1].split("--")[0]
                : null;
            let modifier = className.split("--")[1];

            if (block) {
                //Blocks
                if (!styles.hasOwnProperty(block)) {
                    styles[block] = {};
                    styles[block][_blockModifierName] = [];
                }

                //Elements
                if (element && !styles[block].hasOwnProperty(element)) {
                    styles[block][element] = [];
                }

                //Modifiers
                if (modifier) {
                    if (!element) {
                        //If there is no element, the modifier applies to the block
                        styles[block][_blockModifierName].push(modifier);
                    } else {
                        if (!styles[block][element].includes(modifier)) {
                            styles[block][element].push(modifier);
                        }
                    }
                }
            }
        }
    });

    if (!flat) {
        Object.keys(styles).forEach(block => {
            styleSheet = `${styleSheet}.${block}{`;
            Object.keys(styles[block])
                .filter(element => {
                    return element !== _blockModifierName;
                })
                .forEach(element => {
                    styleSheet = `${styleSheet}&__${element}{`;
                    styles[block][element].forEach(modifier => {
                        styleSheet = `${styleSheet}&--${modifier}{}`;
                    });
                    styleSheet = `${styleSheet}}`;
                });

            styles[block][_blockModifierName].forEach(blockModifier => {
                styleSheet = `${styleSheet}&--${blockModifier}{}`;
            });

            styleSheet = `${styleSheet}}`;
        });
    }
    return styleSheet;
}

//Get all classes from a block of html
export function getClasses(html: string) {
    let classNames: string[] = [];
    const regex = /class="([a-zA-Z0-9-_ ]+)"/g;
    const classNameRegex: RegExp = /"(.*)"/;
    if (classNameRegex === null) {
        return null;
    }
    let match;
    while ((match = regex.exec(html))) {
        let classes = classNameRegex.exec(match[0]);
        if (classes === null || classes.length < 2) {
            return;
        }
        classes[1].split(" ").forEach(className => {
            if (classNames.indexOf(className) === -1) {
                classNames.push(className);
            }
        });
    }
    return classNames;
}

//Get the last class name from a block of html
function getParentClassName(html: string, matchElements: boolean) {
    const regex = matchElements
        ? /class="([a-zA-Z0-9-_]+ ?)+"/g
        : /class="([a-zA-Z0-9-]+ ?)+"/g;

    let matches = html.match(regex);

    if (matches === null) {
        return null;
    }

    let lastMatch = matches[matches.length - 1];

    let classNameMatches = lastMatch.match(/"(.*)"/);

    if (classNameMatches === null) {
        return null;
    }
    return classNameMatches[classNameMatches.length - 1]
        .split("--")[0]
        .split(" ")[0];
}

//Is a class name following BEM conventions?
function isBemClass(className: string): boolean {
    return !(
        className.split("__").length > 2 || className.split("--").length > 2
    );
}

function getClassNameDepthProblems(
    html: string,
    activeEditor: vscode.TextEditor
) {
    let errors = new Array();

    let classes = getClasses(html);

    if (!classes) {
        return errors;
    }

    classes.forEach(className => {
        if (!isBemClass(className)) {
            let i = -1;
            while ((i = html.indexOf(className, i + 1)) !== -1) {
                const startPos = activeEditor.document.positionAt(i);
                const endPos = activeEditor.document.positionAt(
                    i + className.length
                );
                errors.push({
                    code: "",
                    message:
                        "BEM - classes must only consist of block and element.",
                    range: new vscode.Range(startPos, endPos),
                    severity: vscode.DiagnosticSeverity.Warning,
                    source: "",
                    relatedInformation: [
                        new vscode.DiagnosticRelatedInformation(
                            new vscode.Location(
                                activeEditor.document.uri,
                                new vscode.Range(
                                    new vscode.Position(
                                        startPos.line,
                                        startPos.character
                                    ),
                                    new vscode.Position(
                                        endPos.line,
                                        endPos.character
                                    )
                                )
                            ),
                            `${className}`
                        )
                    ],
                    className: className
                });
            }
        }
    });

    return errors;
}

function getClassNameCaseProblems(
    html: string,
    activeEditor: vscode.TextEditor,
    casing: string
) {
    let errors = new Array();
    let acceptedClassNameRegex;
    let classes = getClasses(html);
    switch (casing) {
        case ClassNameCases.Any:
            return errors;
        case ClassNameCases.Kebab:
            acceptedClassNameRegex = /^([a-z0-9-]*((__){1}[a-z0-9-]+)?((--){1}[a-z0-9-]+)?)$/g; ///^([a-z0-9-]*(__)?[a-z0-9-]*(--)?[a-z-]*)*$/g;
            break;
        case ClassNameCases.Snake:
            acceptedClassNameRegex = /^([a-z0-9_]*((__){1}[a-z0-9_]+)?((--){1}[a-z0-9_]+)?)$/g;
            break;
        default:
            return errors;
    }

    if (!classes) {
        return errors;
    }
    if (!acceptedClassNameRegex) {
        return errors;
    }

    classes.forEach(className => {
        if (!className.match(acceptedClassNameRegex)) {
            let i = -1;
            while ((i = html.indexOf(className, i + 1)) !== -1) {
                const startPos = activeEditor.document.positionAt(i);
                const endPos = activeEditor.document.positionAt(
                    i + className.length
                );
                errors.push({
                    code: "",
                    message: `BEM - Class names must be in ${casing} case `,
                    range: new vscode.Range(startPos, endPos),
                    severity: vscode.DiagnosticSeverity.Warning,
                    source: "",
                    relatedInformation: [
                        new vscode.DiagnosticRelatedInformation(
                            new vscode.Location(
                                activeEditor.document.uri,
                                new vscode.Range(
                                    new vscode.Position(
                                        startPos.line,
                                        startPos.character
                                    ),
                                    new vscode.Position(
                                        endPos.line,
                                        endPos.character
                                    )
                                )
                            ),
                            `${className}`
                        )
                    ],
                    className: className
                });
            }
        }
    });
    return errors;
}

// Draw errors to the VScode window
function updateDiagnostics(
    document: vscode.TextDocument,
    collection: vscode.DiagnosticCollection
): void {
    let activeEditor = vscode.window.activeTextEditor;
    if (activeEditor === undefined) {
        return;
    }
    const docText = document.getText();
    let editorHighlights = new Array();

    if (
        vscode.workspace.getConfiguration().get("bemHelper.showDepthWarnings")
    ) {
        editorHighlights = editorHighlights.concat(
            getClassNameDepthProblems(docText, activeEditor)
        );
    }

    let acceptedClassNameCase = vscode.workspace
        .getConfiguration()
        .get("bemHelper.classNameCase");
    if (acceptedClassNameCase) {
        editorHighlights = editorHighlights.concat(
            getClassNameCaseProblems(
                docText,
                activeEditor,
                acceptedClassNameCase.toString()
            )
        );
    }

    if (editorHighlights.length > 0) {
        collection.set(document.uri, editorHighlights);
    } else {
        collection.clear();
    }
}

//#endregion

export function activate(context: vscode.ExtensionContext) {
    //#region Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.insertBemModifier", () => {
            let textEditor = vscode.window.activeTextEditor;

            if (textEditor === undefined) {
                vscode.window.showErrorMessage(
                    "No active text editor. Please open a file"
                );
                return;
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

            let className = getParentClassName(precedingText, true);
            if (className === null) {
                vscode.window.showErrorMessage(
                    "Could not find any classes in current file."
                );
                return;
            }

            let outputText = `<div class="${className} ${className}--"></div>`;

            let myEdit = vscode.TextEdit.insert(cursorPosition, outputText);

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
        }),
        vscode.commands.registerCommand("extension.insertBemElement", () => {
            let textEditor = vscode.window.activeTextEditor;

            if (textEditor === undefined) {
                vscode.window.showErrorMessage(
                    "No active text editor. Please open a file"
                );
                return;
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

            let className = getParentClassName(precedingText, false);
            if (className === null) {
                vscode.window.showErrorMessage(
                    "Could not find any classes in current file."
                );
                return;
            }

            let outputText = `<div class="${className}__"></div>`;

            let myEdit = vscode.TextEdit.insert(cursorPosition, outputText);

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
        }),
        vscode.commands.registerCommand("extension.generateStyleSheet", () => {
            let textEditor = vscode.window.activeTextEditor;

            if (!textEditor) {
                vscode.window.showErrorMessage(
                    "No active text editor. Please open a file"
                );
                return;
            }

            vscode.window
                .showQuickPick(["scss", "less", "css"], {
                    placeHolder: "Choose a type of stylesheet to generate"
                })
                .then(stylesheetLanguage => {
                    if (!stylesheetLanguage) {
                        vscode.window.showErrorMessage(
                            "No stylesheet type selected."
                        );
                        return;
                    }

                    let documentText = textEditor!.document.getText();
                    let classes = getClasses(documentText);
                    if (!classes) {
                        return;
                    }
                    let stylesheet = generateStyleSheet(
                        classes,
                        stylesheetLanguage === "css"
                    );

                    vscode.workspace
                        .openTextDocument({
                            language: stylesheetLanguage,
                            content: stylesheet
                        })
                        .then(doc => {
                            vscode.window.showTextDocument(doc).then(e => {
                                vscode.commands.executeCommand(
                                    "editor.action.formatDocument"
                                );
                            });
                        });
                });
        })
    );
    //#endregion
    //#region Register Diagnostics
    const collection = vscode.languages.createDiagnosticCollection("BEM");
    if (vscode.window.activeTextEditor) {
        updateDiagnostics(vscode.window.activeTextEditor.document, collection);
    }
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(e => {
            updateDiagnostics(e, collection);
        }),
        vscode.workspace.onDidOpenTextDocument(e => {
            updateDiagnostics(e, collection);
        }),
        vscode.window.onDidChangeActiveTextEditor(e => {
            if (e) {
                updateDiagnostics(e.document, collection);
            }
        })
    );
    if (
        vscode.workspace.getConfiguration().get("bemHelper.responsiveLinting")
    ) {
        context.subscriptions.push(
            vscode.workspace.onDidChangeTextDocument(e => {
                if (e) {
                    updateDiagnostics(e.document, collection);
                }
            })
        );
    }
    //#endregion
}

exports.activate = activate;

export function deactivate() {}
