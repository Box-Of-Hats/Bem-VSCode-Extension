import * as vscode from "vscode";
import { BemHelper, ClassNameCases } from "./BemHelper";
import { getConfigValue } from "./ez-vscode";

export class BemDiagnosticProvider {
	bemHelper: BemHelper;

	public diagnosticCollectionName = "BemHelper";

	public errors: vscode.Diagnostic[] = [];

	constructor(bemHelper: BemHelper) {
		this.bemHelper = bemHelper;

		let elementSeparator = getConfigValue(
			"bemHelper.elementSeparator",
			"__"
		);
		let modifierSeparator = getConfigValue(
			"bemHelper.modifierSeparator",
			"--"
		);

		this.bemHelper.elementSeparator = elementSeparator;
		this.bemHelper.modifierSeparator = modifierSeparator;
	}

	/*
	 * Get a list of errors with class depth problems (e.g 'one__two__three')
	 */
	public getClassNameDepthProblems(
		html: string,
		activeEditor: vscode.TextEditor
	) {
		let errors: vscode.Diagnostic[] = [];

		let classes = this.bemHelper.getClasses(html);

		if (!classes) {
			return errors;
		}

		classes.forEach((className) => {
			if (!this.bemHelper.isBemClass(className)) {
				let i = -1;
				if (className === "") {
					//Dont process empty class names as they can cause issues with indexOf
					return;
				}
				while (
					(i = html.indexOf(className, i + 1)) !== -1 &&
					html.length >= i
				) {
					const startPos = activeEditor.document.positionAt(i);
					const endPos = activeEditor.document.positionAt(
						i + className.length
					);
					errors.push({
						code: "depth",
						message:
							"BEM - classes must only consist of block and element.",
						range: new vscode.Range(startPos, endPos),
						severity: vscode.DiagnosticSeverity.Warning,
						source: "bem helper",
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
							),
						],
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
		allowedCasings: ClassNameCases[],
		maxCount: number
	) {
		let errors: vscode.Diagnostic[] = [];
		let classes = this.bemHelper.getClasses(html, undefined, true);

		if (!classes) {
			return errors;
		}

		for (const className of classes) {
			if (errors.length >= maxCount) {
				break;
			}

			const matchesAnyCase = allowedCasings.find((casing) =>
				this.bemHelper.isCaseMatch(className, casing)
			);

			if (matchesAnyCase) {
				continue;
			}

			let i = -1;
			if (className === "") {
				//Dont process empty class names as they can cause issues with indexOf
				return [];
			}
			while (
				(i = html.indexOf(className, i + 1)) !== -1 &&
				html.length >= i
			) {
				const startPos = activeEditor.document.positionAt(i);
				const endPos = activeEditor.document.positionAt(
					i + className.length
				);

				// Check that the matched line is a class name definition
				let lineRange = new vscode.Range(
					new vscode.Position(startPos.line, 0),
					new vscode.Position(startPos.line, 1000)
				);

				let lineText = activeEditor.document.getText(lineRange);

				if (!lineText.match(this.bemHelper.classPropertyValueRegex)) {
					// Skip match if it is not a class name definition
					continue;
				}

				errors.push({
					code: "case",
					message: `BEM - Class names must be in ${allowedCasings.join(
						" or "
					)} case`,
					range: new vscode.Range(startPos, endPos),
					severity: vscode.DiagnosticSeverity.Warning,
					source: "bem helper",
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
						),
					],
				});
			}
		}

		return errors.slice(0, maxCount);
	}

	/*
	 * Get all diagnostic errors in the current document
	 * and draw them to the VScode window
	 */
	public updateDiagnostics(
		document: vscode.TextDocument,
		collection: vscode.DiagnosticCollection
	): void {
		let activeEditor = vscode.window.activeTextEditor;
		if (activeEditor === undefined) {
			return;
		}

		// Don't check for issues if language is not enabled
		const languages = getConfigValue<string[]>("bemHelper.languages", []);
		if (!languages.includes(activeEditor.document.languageId)) {
			collection.clear();
            this.errors = [];
			return;
		}

		let maxWarningCount = getConfigValue("bemHelper.maxWarningsCount", 100);

		const docText = document.getText();
		let editorHighlights = new Array();

		//Verify class name depth
		if (getConfigValue("bemHelper.showDepthWarnings", false)) {
			editorHighlights = editorHighlights.concat(
				this.getClassNameDepthProblems(docText, activeEditor)
			);
		}

		//Verify class name cases

		const classNameCaseSetting: string | undefined = vscode.workspace
			.getConfiguration()
			.get("bemHelper.classNameCase");

		const acceptedClassNameCases: ClassNameCases[] = classNameCaseSetting
			?.split(",")
			.map((v) => {
				return v as ClassNameCases;
			})
			.filter((classCase) => classCase) ?? [ClassNameCases.Any];

		if (!acceptedClassNameCases.includes(ClassNameCases.Any)) {
			editorHighlights = editorHighlights.concat(
				this.getClassNameCaseProblems(
					docText,
					activeEditor,
					acceptedClassNameCases,
					maxWarningCount
				)
			);
		}

		if (editorHighlights.length > 0) {
			collection.set(document.uri, editorHighlights);
		} else {
			collection.clear();
		}
		this.errors = editorHighlights;
	}
}
