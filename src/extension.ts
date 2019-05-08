import * as vscode from "vscode";

enum ClassNameCases {
    Any = "any",
    Kebab = "kebab",
    Snake = "snake",
    CamelCase = "camel",
    Pascal = "pascal"
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
    const regex = /class(Name)?="([a-zA-Z0-9-_ ]+)"/g;
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
        ? /class(Name)?="([a-zA-Z0-9-_]+ ?)+"/g
        : /class(Name)?="([a-zA-Z0-9-]+ ?)+"/g;

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

//Check if a className is in a given case
export function isCaseMatch(className: string, caseType: string): boolean {
    className = className.replace(/__/g, "").replace(/--/g, "");
    let allowedClassNamePattern;
    switch (caseType) {
        case ClassNameCases.Any:
            return true;
        case ClassNameCases.Kebab:
            allowedClassNamePattern = /^[a-z0-9-]+$/;
            break;
        case ClassNameCases.Snake:
            allowedClassNamePattern = /^[a-z0-9_]+$/;
            break;
        case ClassNameCases.Pascal:
            allowedClassNamePattern = /^[A-Z]{1}[a-zA-Z0-9]+$/;
            break;
        case ClassNameCases.CamelCase:
            allowedClassNamePattern = /^[a-z]{1}[a-zA-Z0-9]+$/;
            break;
        default:
            return false;
    }
    let matches = className.match(allowedClassNamePattern);
    if (!matches) {
        return false;
    }
    return true;
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
    let classes = getClasses(html);

    if (!classes) {
        return errors;
    }

    classes.forEach(className => {
        if (!isCaseMatch(className, casing)) {
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

function getClassPropertyTitle(): string {
    let textEditor = vscode.window.activeTextEditor;
    if (!textEditor) {
        return "class";
    }
    if (
        textEditor.document.languageId === "javascriptreact" ||
        textEditor.document.languageId === "typescriptreact"
    ) {
        return "className";
    }

    return "class";
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

    //Verify class name depth
    if (
        vscode.workspace.getConfiguration().get("bemHelper.showDepthWarnings")
    ) {
        editorHighlights = editorHighlights.concat(
            getClassNameDepthProblems(docText, activeEditor)
        );
    }

    //Verify class name cases
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

            let className = getParentClassName(
                textEditor.document.getText(
                    new vscode.Range(
                        0,
                        0,
                        textEditor.selection.active.line,
                        textEditor.selection.active.character
                    )
                ),
                true
            );
            if (className === null) {
                vscode.window.showErrorMessage(
                    "Could not find any classes in current file."
                );
                return;
            }
            let classProperty = getClassPropertyTitle();
            let tagList = vscode.workspace
                .getConfiguration()
                .get("bemHelper.tagList");
            textEditor.insertSnippet(
                new vscode.SnippetString(
                    `<\${2|${tagList}|} ${classProperty}="${className} ${className}--$1">$0</$2>`
                )
            );
        }),
        vscode.commands.registerCommand("extension.insertBemElement", () => {
            let textEditor = vscode.window.activeTextEditor;

            if (textEditor === undefined) {
                vscode.window.showErrorMessage(
                    "No active text editor. Please open a file"
                );
                return;
            }

            let className = getParentClassName(
                textEditor.document.getText(
                    new vscode.Range(
                        0,
                        0,
                        textEditor.selection.active.line,
                        textEditor.selection.active.character
                    )
                ),
                false
            );
            if (className === null) {
                vscode.window.showErrorMessage(
                    "Could not find any classes in current file."
                );
                return;
            }
            let classProperty = getClassPropertyTitle();
            let tagList = vscode.workspace
                .getConfiguration()
                .get("bemHelper.tagList");
            textEditor.insertSnippet(
                new vscode.SnippetString(
                    `<\${2|${tagList}|} ${classProperty}="${className}__$1">$0</$2>`
                )
            );
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
                    let infoMessage = vscode.window.setStatusBarMessage(
                        `Generating ${stylesheetLanguage}...`
                    );

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
                            vscode.window
                                .showTextDocument(doc)
                                .then(e => {
                                    vscode.commands.executeCommand(
                                        "editor.action.formatDocument"
                                    );
                                })
                                .then(infoMessage.dispose());
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
