import * as vscode from "vscode";
import { ClassNameCases, BemHelper } from "BemHelper";
import { getConfigValue } from "ez-vscode";

export class BemHelperCodeActionsProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix,
    ];
    public static diagnostics: vscode.Diagnostic[] = [];
    public bemHelper = new BemHelper();

    /*
     * Check if a diagnostic is fixable and provide quick fixes if so
     */
    public provideQuickFixes(
        diagnostic: vscode.Diagnostic,
        document: vscode.TextDocument
    ): vscode.CodeAction[] {
        let fixes: vscode.CodeAction[] = [];

        if (!this.isQuickFixable(diagnostic)) {
            // Diagnostic is not fixable
            return fixes;
        }
        let className = document.getText(diagnostic.range);
        if (diagnostic.code === "depth") {
            // Depth error
            return fixes;
        }
        if (diagnostic.code === "case") {
            let acceptedClassNameCase = getConfigValue(
                "bemHelper.classNameCase",
                ClassNameCases.Any
            );

            if (acceptedClassNameCase === ClassNameCases.Any) {
                return fixes;
            }

            fixes.push(
                this.createFix(
                    document,
                    diagnostic.range,
                    this.bemHelper.convertClass(
                        className,
                        acceptedClassNameCase
                    ),
                    className.length
                )
            );
        }
        return fixes;
    }

    public isQuickFixable(diagnostic: vscode.Diagnostic) {
        //TODO: Implement check
        // if (diagnostic.relatedInformation[0].message){

        // }
        return true;
    }

    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range
    ): vscode.CodeAction[] | undefined {
        let fixes: vscode.CodeAction[] = [];
        BemHelperCodeActionsProvider.diagnostics.forEach((diagnostic) => {
            if (range.contains(diagnostic.range)) {
                //Check that the diagnostic falls within the current cursor range
                // Otherwise, all diagnostic quickfixes are shown
                let fixesForThisDiagnostic = this.provideQuickFixes(
                    diagnostic,
                    document
                );
                fixes = fixes.concat(...fixesForThisDiagnostic);
            }
        });
        return fixes;
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
