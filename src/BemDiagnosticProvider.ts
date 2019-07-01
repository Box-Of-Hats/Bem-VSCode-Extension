import * as vscode from "vscode";
import { BemHelper, ClassNameCases } from "./BemHelper";

export class BemDiagnosticProvider {
    public diagnosticCollectionName = "BemHelper";
    public bemHelper: BemHelper = new BemHelper();

    /*
     * Get a list of errors with class depth problems (e.g 'one__two__three')
     */
    public getClassNameDepthProblems(
        html: string,
        activeEditor: vscode.TextEditor
    ) {
        let errors = new Array();

        let classes = this.bemHelper.getClasses(html);

        if (!classes) {
            return errors;
        }

        classes.forEach(className => {
            if (!this.bemHelper.isBemClass(className)) {
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

    /*
     * Get a list of errors with class name cases
     */
    public getClassNameCaseProblems(
        html: string,
        activeEditor: vscode.TextEditor,
        casing: ClassNameCases
    ) {
        let errors = new Array();
        let classes = this.bemHelper.getClasses(html);

        if (!classes) {
            return errors;
        }

        classes.forEach(className => {
            if (!this.bemHelper.isCaseMatch(className, casing)) {
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
    public updateDiagnostics(
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
            vscode.workspace
                .getConfiguration()
                .get("this.bemHelper.showDepthWarnings")
        ) {
            editorHighlights = editorHighlights.concat(
                this.getClassNameDepthProblems(docText, activeEditor)
            );
        }

        //Verify class name cases
        let acceptedClassNameCase:
            | ClassNameCases
            | undefined = vscode.workspace
            .getConfiguration()
            .get("this.bemHelper.classNameCase");

        if (acceptedClassNameCase) {
            editorHighlights = editorHighlights.concat(
                this.getClassNameCaseProblems(
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
}
