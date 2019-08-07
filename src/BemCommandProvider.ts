import { BemHelper, ClassNameCases } from "./BemHelper";
import * as vscode from "vscode";

export class BemCommandProvider {
    private bemHelper = new BemHelper();

    public setBemSeparators(elementSeparator: string, modifierSeparator) {
        this.bemHelper.elementSeparator = elementSeparator;
        this.bemHelper.modifierSeparator = modifierSeparator;
    }

    /*
     * Convert the selected text to a given case, selected via a prompt
     */
    public convertSelectionToCase(): void {
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
                    ClassNameCases.Camel.valueOf()
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

                let newClassname = this.bemHelper.convertClass(selectionText, <
                    ClassNameCases
                >caseType);
                textEditor.insertSnippet(
                    new vscode.SnippetString(`${newClassname}`)
                );
            });
    }

    /*
     * Generate a stylesheet for the current open text editor and open it in a new tab
     */
    public generateStyleSheetForCurrentDocument(): void {
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
                let classes = this.bemHelper.getClasses(documentText);
                if (!classes) {
                    return;
                }
                let stylesheet = this.bemHelper.generateStyleSheet(
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
    }

    public insertElementAtCursor(isModified: boolean): void {
        let textEditor = vscode.window.activeTextEditor;

        if (textEditor === undefined) {
            vscode.window.showErrorMessage(
                "No active text editor. Please open a file"
            );
            return;
        }

        let className = this.bemHelper.getPrecedingClassName(
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
        let classProperty = this.bemHelper.getClassPropertyWord(
            textEditor.document.languageId
        );
        let tagList = vscode.workspace
            .getConfiguration()
            .get("bemHelper.tagList");

        if (isModified) {
            textEditor.insertSnippet(
                new vscode.SnippetString(
                    `<\${3|${tagList}|} ${classProperty}="${className}${
                        this.bemHelper.elementSeparator
                    }$1 ${className}${this.bemHelper.elementSeparator}$1${
                        this.bemHelper.modifierSeparator
                    }$2">$0</$3>`
                )
            );
        } else {
            textEditor.insertSnippet(
                new vscode.SnippetString(
                    `<\${2|${tagList}|} ${classProperty}="${className}${
                        this.bemHelper.elementSeparator
                    }$1">$0</$2>`
                )
            );
        }
    }
}
