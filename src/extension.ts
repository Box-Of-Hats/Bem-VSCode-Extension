import * as vscode from "vscode";

//import { BemHelper, ClassNameCases } from "./BemHelper";
import { BemCommandProvider } from "./BemCommandProvider";

//let bemHelper = new BemHelper();

//#region methods

function getClassNameDepthProblems(
    html: string,
    activeEditor: vscode.TextEditor
) {
    let errors = new Array();

    let classes = bemHelper.getClasses(html);

    if (!classes) {
        return errors;
    }

    classes.forEach(className => {
        if (!bemHelper.isBemClass(className)) {
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
    let classes = bemHelper.getClasses(html);

    if (!classes) {
        return errors;
    }

    classes.forEach(className => {
        if (!bemHelper.isCaseMatch(className, casing)) {
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
    let bemCommandProvider = new BemCommandProvider();

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "extension.bemHelper.insertModifiedElement",
            () => {
                bemCommandProvider.insertElementAtCursor(true);
            }
        ),
        vscode.commands.registerCommand(
            "extension.bemHelper.insertElement",
            () => {
                bemCommandProvider.insertElementAtCursor(false);
            }
        ),
        vscode.commands.registerCommand(
            "extension.bemHelper.generateStyleSheet",
            () => {
                bemCommandProvider.generateStyleSheetForCurrentDocument();
            }
        ),

        vscode.commands.registerCommand(
            "extension.bemHelper.convertSelectionToCase",
            () => {
                bemCommandProvider.convertSelectionToCase();
            }
        )
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

        if (
            !acceptedClassNameCase ||
            acceptedClassNameCase === ClassNameCases.Any
        ) {
            // No case is set so provide all quick fixes
            fixes = [
                ClassNameCases.Kebab,
                ClassNameCases.Snake,
                ClassNameCases.CamelCase,
                ClassNameCases.Pascal
            ].map(textCase => {
                const start = range.start;
                const line = document.lineAt(start.line);
                let classNames = bemHelper.getClasses(line.text);
                let oldClassName = "";
                if (classNames) {
                    oldClassName = classNames[0];
                }
                if (!oldClassName) {
                    oldClassName = "";
                }
                let convertedClassName = bemHelper.convertClass(
                    oldClassName,
                    textCase
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
            let classNames = bemHelper.getClasses(line.text);
            let oldClassName = "";
            if (classNames) {
                oldClassName = classNames[0];
            }
            if (!oldClassName) {
                oldClassName = "";
            }
            let convertedClassName = bemHelper.convertClass(
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
