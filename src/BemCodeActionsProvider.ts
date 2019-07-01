import * as vscode from "vscode";
import { ClassNameCases, BemHelper } from "./BemHelper";

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

        let bemHelper = new BemHelper();

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
