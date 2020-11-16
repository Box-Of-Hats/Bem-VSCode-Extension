import * as vscode from "vscode";
import { BemCommandProvider } from "./BemCommandProvider";
import { BemHelperCodeActionsProvider } from "./BemCodeActionsProvider";
import { BemDiagnosticProvider } from "./BemDiagnosticProvider";
import { getConfigValue } from "./ez-vscode";
import { BemHelper } from "./BemHelper";
import { defaultLanguageProviders } from "./languageProviders";
import { defaultClassNameProviders } from "./classNameProviders";

// Initialise global BemHelper object
const bemHelper = new BemHelper();

defaultLanguageProviders.forEach((provider) =>
	bemHelper.registerLanguageProvider(provider)
);

defaultClassNameProviders.forEach((provider) =>
	bemHelper.registerClassNameProvider(provider)
);

const codeActionsProvider = new BemHelperCodeActionsProvider(bemHelper);

export function activate(context: vscode.ExtensionContext) {
	registerCommands(context);
	registerDiagnostics(context);
	registerCodeActions(context);
}

export function deactivate() {}

function registerDiagnostics(context: vscode.ExtensionContext) {
	const bemDiagnosticProvider = new BemDiagnosticProvider(bemHelper);
	const collection = vscode.languages.createDiagnosticCollection(
		bemDiagnosticProvider.diagnosticCollectionName
	);
	if (vscode.window.activeTextEditor) {
		bemDiagnosticProvider.updateDiagnostics(
			vscode.window.activeTextEditor.document,
			collection
		);
		// Update code actions provider so that quick fixes can be generated
		BemHelperCodeActionsProvider.diagnostics = bemDiagnosticProvider.errors;
	}
	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument((e) => {
			bemDiagnosticProvider.updateDiagnostics(e, collection);
			// Update code actions provider so that quick fixes can be generated
			BemHelperCodeActionsProvider.diagnostics =
				bemDiagnosticProvider.errors;
		}),

		vscode.workspace.onDidOpenTextDocument((e) => {
			bemDiagnosticProvider.updateDiagnostics(e, collection);
			// Update code actions provider so that quick fixes can be generated
			BemHelperCodeActionsProvider.diagnostics =
				bemDiagnosticProvider.errors;
		}),
		vscode.window.onDidChangeActiveTextEditor((e) => {
			if (e) {
				bemDiagnosticProvider.updateDiagnostics(e.document, collection);
			}
			// Update code actions provider so that quick fixes can be generated
			BemHelperCodeActionsProvider.diagnostics =
				bemDiagnosticProvider.errors;
		})
	);
	if (getConfigValue("bemHelper.responsiveLinting", false)) {
		// Update on character press if specified in settings
		context.subscriptions.push(
			vscode.workspace.onDidChangeTextDocument((e) => {
				if (e) {
					bemDiagnosticProvider.updateDiagnostics(
						e.document,
						collection
					);
					// Update code actions provider so that quick fixes can be generated
					BemHelperCodeActionsProvider.diagnostics =
						bemDiagnosticProvider.errors;
				}
			})
		);
	}
}

function registerCommands(context: vscode.ExtensionContext) {
	//Initialise BemCommandProvider with any settings found
	const bemCommandProvider = new BemCommandProvider(bemHelper);

	let elementSeparator = getConfigValue("bemHelper.elementSeparator", "__");
	let modifierSeparator = getConfigValue("bemHelper.modifierSeparator", "--");

	bemCommandProvider.setBemSeparators(elementSeparator, modifierSeparator);

	//Register commands
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
			"extension.bemHelper.generateStyleSheetFromSelection",
			() => {
				bemCommandProvider.generateStyleSheetForSelection();
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

function registerCodeActions(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider("*", codeActionsProvider, {
			providedCodeActionKinds:
				BemHelperCodeActionsProvider.providedCodeActionKinds,
		})
	);
}

exports.activate = activate;
