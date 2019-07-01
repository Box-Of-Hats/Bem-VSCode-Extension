import * as vscode from "vscode";

export enum ClassNameCases {
    Any = "any",
    Kebab = "kebab",
    Snake = "snake",
    CamelCase = "camel",
    Pascal = "pascal"
}

interface BemClass {
    block: string;
    element?: string;
    modifier?: string;
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
export function getClasses(html: string): string[] {
    let classNames: string[] = [];
    const regex = /class(Name)?=["']{1}([a-zA-Z0-9-_ ]+)["']{1}/g;
    const classNameRegex = /["']{1}(.*)["']{1}/;
    if (classNameRegex === null) {
        return classNames;
    }
    let match;
    while ((match = regex.exec(html))) {
        let classes = classNameRegex.exec(match[0]);
        if (classes === null || classes.length < 2) {
            return classNames;
        }
        classes[1].split(" ").forEach(className => {
            if (classNames.indexOf(className) === -1) {
                classNames.push(className);
            }
        });
    }
    return classNames;
}

/*Get the last class name from a block of html
 *html: The html string to extract from
 *matchElements: Should the parent name include elements or just blocks?
 */
export function getPrecedingClassName(html: string, matchElements: boolean) {
    const classNameRegex = /class(Name)?="([a-zA-Z0-9-_]+ ?)+"/g;

    let matches = html.match(classNameRegex);

    if (matches === null) {
        return null;
    }

    //If only including blocks, remove element classes
    matches = matchElements
        ? matches
        : matches.filter(match => {
              return !match.includes("__");
          });

    let lastMatch = matches[matches.length - 1];

    let classNameMatches = lastMatch.match(/"(.*)"/);

    if (classNameMatches === null) {
        return null;
    }
    return classNameMatches[classNameMatches.length - 1]
        .split("--")[0]
        .split(" ")[0];
}

export function getClassCaseType(className: string): ClassNameCases {
    className = className.replace(/__/g, "").replace(/--/g, "");

    if (className.match(/^[a-z0-9-]+$/)) {
        return ClassNameCases.Kebab;
    } else if (className.match(/^[a-z0-9_]+$/)) {
        return ClassNameCases.Snake;
    } else if (className.match(/^[A-Z]{1}[a-zA-Z0-9]+$/)) {
        return ClassNameCases.Pascal;
    } else if (className.match(/^[a-z]{1}[a-zA-Z0-9]+$/)) {
        return ClassNameCases.CamelCase;
    }
    return ClassNameCases.Any;
}

/*
    Create a classstring from a BemClass object
*/
function createClass(bemClass: BemClass): string {
    let classString = "";

    if (bemClass.element && bemClass.modifier) {
        //block__element--modifier
        classString = `${bemClass.block}__${bemClass.element}--${
            bemClass.modifier
        }`;
    } else if (!bemClass.element && bemClass.modifier) {
        //block--modifier
        classString = `${bemClass.block}--${bemClass.modifier}`;
    } else if (bemClass.element && !bemClass.modifier) {
        //block__element
        classString = `${bemClass.block}__${bemClass.element}`;
    } else {
        //block
        classString = bemClass.block;
    }
    return classString;
}

/*Convert a string to a case
 */
function convertStringToCase(word: string, toClassType: ClassNameCases) {
    let outputClass = word;

    let classNameWords = word
        .replace("-", " ")
        .replace("_", " ")
        .split("")
        .map(char => {
            if (char.match(/^[A-Z]$/)) {
                return ` ${char}`;
            } else {
                return char;
            }
        })
        .join("")
        .toLowerCase()
        .trim()
        .split(" ")
        .filter(word => {
            return word;
        });

    switch (toClassType) {
        case ClassNameCases.Kebab:
            outputClass = classNameWords.join("-");
            break;
        case ClassNameCases.Snake:
            outputClass = classNameWords.join("_");
            break;
        case ClassNameCases.CamelCase:
            outputClass = classNameWords
                .map((word, index) => {
                    if (index === 0) {
                        return word;
                    }
                    return `${word[0].toUpperCase()}${word.slice(1)}`;
                })
                .join("");
            break;
        case ClassNameCases.Pascal:
            outputClass = classNameWords
                .map(word => {
                    return `${word[0].toUpperCase()}${word.slice(1)}`;
                })
                .join("");
            break;
        default:
            break;
    }
    return outputClass;
}

export function convertClass(sourceClass: string, toClassType: ClassNameCases) {
    let modifier = sourceClass.includes("--")
        ? sourceClass.split("--")[sourceClass.split("--").length - 1]
        : "";
    let element = sourceClass.includes("__")
        ? sourceClass
              .split("__")
              [sourceClass.split("__").length - 1].split("--")[0]
        : "";
    let block = sourceClass.split("__")[0];

    let classElements: BemClass = {
        block: convertStringToCase(block, toClassType),
        element: convertStringToCase(element, toClassType),
        modifier: convertStringToCase(modifier, toClassType)
    };

    return createClass(classElements);
}

//Is a class name following BEM conventions?
function isBemClass(className: string): boolean {
    return !(
        className.split("__").length > 2 || className.split("--").length > 2
    );
}

//Check if a className is in a given case
export function isCaseMatch(
    className: string,
    caseType: ClassNameCases
): boolean {
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
    casing: ClassNameCases
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
    let acceptedClassNameCase:
        | ClassNameCases
        | undefined = vscode.workspace
        .getConfiguration()
        .get("bemHelper.classNameCase");

    if (acceptedClassNameCase) {
        editorHighlights = editorHighlights.concat(
            getClassNameCaseProblems(
                docText,
                activeEditor,
                acceptedClassNameCase
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

export function convertClassToCaseCommand() {
    let textEditor = vscode.window.activeTextEditor;

    if (!textEditor) {
        vscode.window.showErrorMessage(
            "No active text editor. Please open a file"
        );
        return;
    }

    vscode.window
        .showQuickPick(
            [
                ClassNameCases.Kebab.valueOf(),
                ClassNameCases.Snake.valueOf(),
                ClassNameCases.Pascal.valueOf(),
                ClassNameCases.CamelCase.valueOf()
            ],
            {
                placeHolder: "Choose a class case"
            }
        )
        .then(caseType => {
            if (!caseType) {
                vscode.window.showErrorMessage("No class case selected.");
                return;
            }
            if (!textEditor) {
                return;
            }
            let selectionText = textEditor.document.getText(
                textEditor.selection
            );

            let newClassname = convertClass(selectionText, <ClassNameCases>(
                caseType
            ));
            textEditor.insertSnippet(
                new vscode.SnippetString(`${newClassname}`)
            );
        });
}

export function activate(context: vscode.ExtensionContext) {
    registerCommands(context);
    registerDiagnostics(context);
    //registerCodeActions(context);

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "*",
            new BemHelperCodeActionsProvider(),
            {
                providedCodeActionKinds:
                    BemHelperCodeActionsProvider.providedCodeActionKinds
            }
        )
    );
}

function registerDiagnostics(context: vscode.ExtensionContext) {
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
}

// Register Commands
function registerCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.insertBemModifier", () => {
            let textEditor = vscode.window.activeTextEditor;

            if (textEditor === undefined) {
                vscode.window.showErrorMessage(
                    "No active text editor. Please open a file"
                );
                return;
            }

            let className = getPrecedingClassName(
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

            let className = getPrecedingClassName(
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
        }),

        vscode.commands.registerCommand("extension.convertClassToCase", () => {
            convertClassToCaseCommand();
        })
    );
}

exports.activate = activate;

export function deactivate() {}

/////////////////////////////////

/**
 * Provides code actions for converting :) to an smiley emoji.
 */
export class BemHelperCodeActionsProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range
    ): vscode.CodeAction[] | undefined {
        if (!this.shouldDisplayQuickFix(document, range)) {
            return;
        }
        //simple example
        //const replaceWithSmileyFix = this.createFix(document, range, "😀", 2);
        // Marking a single fix as `preferred` means that users can apply it with a
        // single keyboard shortcut using the `Auto Fix` command.
        //replaceWithSmileyFix.isPreferred = true;

        let fixes: vscode.CodeAction[] = [];

        let acceptedClassNameCase:
            | ClassNameCases
            | undefined = vscode.workspace
            .getConfiguration()
            .get("bemHelper.classNameCase");

        if (!acceptedClassNameCase) {
            // No case is set so provide all quick fixes
            fixes = [
                ClassNameCases.Kebab,
                ClassNameCases.Snake,
                ClassNameCases.CamelCase,
                ClassNameCases.Pascal
            ].map(textCase => {
                const start = range.start;
                const line = document.lineAt(start.line);
                let classNames = getClasses(line.text);
                let oldClassName = "";
                if (classNames) {
                    oldClassName = classNames[0];
                }
                if (!oldClassName) {
                    oldClassName = "";
                }
                let convertedClassName = convertClass(oldClassName, textCase);
                const classStringStart = 'class="';
                let classNameRange = new vscode.Range(
                    new vscode.Position(
                        range.start.line,
                        line.text.indexOf(classStringStart) +
                            classStringStart.length
                    ),
                    range.end
                );

                let fix = this.createFix(
                    document,
                    classNameRange,
                    convertedClassName,
                    oldClassName.length
                );
                return fix;
            });
        } else {
            // An accepted class name is provided so only give that as a quickfix option
            const start = range.start;
            const line = document.lineAt(start.line);
            let classNames = getClasses(line.text);
            let oldClassName = "";
            if (classNames) {
                oldClassName = classNames[0];
            }
            if (!oldClassName) {
                oldClassName = "";
            }
            let convertedClassName = convertClass(
                oldClassName,
                acceptedClassNameCase
            );
            const classStringStart = 'class="';
            let classNameRange = new vscode.Range(
                new vscode.Position(
                    range.start.line,
                    line.text.indexOf(classStringStart) +
                        classStringStart.length
                ),
                range.end
            );

            fixes.push(
                this.createFix(
                    document,
                    classNameRange,
                    convertedClassName,
                    oldClassName.length
                )
            );
        }
        return fixes;
    }

    private shouldDisplayQuickFix(
        document: vscode.TextDocument,
        range: vscode.Range
    ) {
        const start = range.start;
        const line = document.lineAt(start.line);
        return line.text.includes("class=");
    }

    private createFix(
        document: vscode.TextDocument,
        range: vscode.Range,
        replacementString: string,
        overwriteLength: number
    ): vscode.CodeAction {
        const fix = new vscode.CodeAction(
            `Convert to ${replacementString}`,
            vscode.CodeActionKind.QuickFix
        );
        fix.edit = new vscode.WorkspaceEdit();
        fix.edit.replace(
            document.uri,
            new vscode.Range(
                range.start,
                range.start.translate(0, overwriteLength)
            ),
            replacementString
        );
        return fix;
    }
}
