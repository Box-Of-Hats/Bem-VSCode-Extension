import * as vscode from "vscode";
import { BemHelper, ClassNameCases } from "./BemHelper";
import { getConfigValue } from "./ez-vscode";

export class BemCommandProvider {
	bemHelper: BemHelper;
	constructor(bemHelper: BemHelper) {
		this.bemHelper = bemHelper;
	}

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
					ClassNameCases.Camel.valueOf(),
					ClassNameCases.ShoutingSnake.valueOf(),
				],
				{
					placeHolder: "Choose a class case",
				}
			)
			.then((caseType) => {
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

				let newClassname = this.bemHelper.convertClass(
					selectionText,
					<ClassNameCases>caseType
				);
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

		let documentText = textEditor.document.getText();

		this.generateStyleSheetForText(documentText);
	}

	public generateStyleSheetForSelection(): void {
		let textEditor = vscode.window.activeTextEditor;

		let documentText = textEditor!.document.getText(textEditor!.selection);

		if (!textEditor) {
			vscode.window.showErrorMessage(
				"No active text editor. Please open a file"
			);
			return;
		}

		this.generateStyleSheetForText(documentText);
	}

	private async generateStyleSheetForText(html: string) {
		const stylesheetLanguage = await vscode.window.showQuickPick(
			["scss", "less", "css"],
			{
				placeHolder: "Choose a type of stylesheet to generate",
			}
		);

		if (!stylesheetLanguage) {
			vscode.window.showErrorMessage("No stylesheet type selected.");
			return;
		}

		const outputType = await vscode.window.showQuickPick(
			["To new editor", "To clipboard"],
			{
				placeHolder:
					"Where do you want to generate the new stylesheet?",
			}
		);

		if (!outputType) {
			vscode.window.showErrorMessage("No output type selected.");
			return;
		}

		const infoMessage = vscode.window.setStatusBarMessage(
			`Generating ${stylesheetLanguage}...`
		);

		let classes = this.bemHelper.getClasses(html);
		if (!classes || classes.length === 0) {
			vscode.window.showErrorMessage(
				"No classes found to generate stylesheet from."
			);
			return;
		}

		if (getConfigValue("bemHelper.sortGeneratedStylesheets", false)) {
			classes = classes.sort();
		}

		const stylesheet = this.bemHelper.generateStyleSheet(
			classes,
			stylesheetLanguage === "css"
		);

		if (outputType === "To clipboard") {
			vscode.env.clipboard.writeText(stylesheet);
			return;
		}

		const document = await vscode.workspace.openTextDocument({
			language: stylesheetLanguage,
			content: stylesheet,
		});

		vscode.window
			.showTextDocument(document)
			.then(() => {
				vscode.commands.executeCommand("editor.action.formatDocument");
			})
			.then(infoMessage.dispose());
	}

	public insertElementAtCursor(isModified: boolean): void {
		let textEditor = vscode.window.activeTextEditor;
		const blockSelectionMode = getConfigValue(
			"bemHelper.blockSelectionMode",
			"prefer-explicit"
		);

		this.bemHelper.ignoredParentClasses = getConfigValue(
			"bemHelper.ignoreClassNames",
			["material-icons"]
		);

		if (textEditor === undefined) {
			vscode.window.showErrorMessage(
				"No active text editor. Please open a file"
			);
			return;
		}

		const language = textEditor.document.languageId;

		let className = this.bemHelper.getPrecedingClassName(
			textEditor.document.getText(
				new vscode.Range(
					0,
					0,
					textEditor.selection.active.line,
					textEditor.selection.active.character
				)
			),
			false,
			blockSelectionMode,
			false,
			language
		);
		if (className === null) {
			vscode.window.showErrorMessage(
				"Could not find any classes in current file."
			);
			return;
		}
		const classProperty = this.bemHelper.getClassPropertyWord(
			textEditor.document.languageId
		);

		let snippet = "";
		const insertNewline = getConfigValue(
			"bemHelper.newLineAfterInsert",
			true
		);

		if (isModified) {
			snippet = `<\${3:div} ${classProperty}="${className}${
				this.bemHelper.elementSeparator
			}$1 ${className}${this.bemHelper.elementSeparator}$1${
				this.bemHelper.modifierSeparator
			}$2">$4</$3>${insertNewline ? "\n" : ""}$0`;
		} else {
			snippet = `<\${2:div} ${classProperty}="${className}${
				this.bemHelper.elementSeparator
			}$1">$3</$2>${insertNewline ? "\n" : ""}$0`;
		}

		textEditor.insertSnippet(new vscode.SnippetString(snippet));
	}
}
