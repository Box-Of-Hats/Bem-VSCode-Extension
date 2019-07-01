import * as vscode from "vscode";
import { BemCommandProvider } from "./BemCommandProvider";

import { BemHelperCodeActionsProvider } from "./BemCodeActionsProvider";
import { BemDiagnosticProvider } from "./BemDiagnosticProvider";

export function activate(context: vscode.ExtensionContext) {
    registerCommands(context);
    registerDiagnostics(context);
    registerCodeActions(context);
}

export function deactivate() {}

function registerDiagnostics(context: vscode.ExtensionContext) {
    const bemDiagnosticProvider = new BemDiagnosticProvider();
    const collection = vscode.languages.createDiagnosticCollection(
        bemDiagnosticProvider.diagnosticCollectionName
    );

    if (vscode.window.activeTextEditor) {
        bemDiagnosticProvider.updateDiagnostics(
            vscode.window.activeTextEditor.document,
            collection
        );
    }
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(e => {
            bemDiagnosticProvider.updateDiagnostics(e, collection);
        }),
        vscode.workspace.onDidOpenTextDocument(e => {
            bemDiagnosticProvider.updateDiagnostics(e, collection);
        }),
        vscode.window.onDidChangeActiveTextEditor(e => {
            if (e) {
                bemDiagnosticProvider.updateDiagnostics(e.document, collection);
            }
        })
    );
    if (
        vscode.workspace.getConfiguration().get("bemHelper.responsiveLinting")
    ) {
        context.subscriptions.push(
            vscode.workspace.onDidChangeTextDocument(e => {
                if (e) {
                    bemDiagnosticProvider.updateDiagnostics(
                        e.document,
                        collection
                    );
                }
            })
        );
    }
}

function registerCommands(context: vscode.ExtensionContext) {
    const bemCommandProvider = new BemCommandProvider();

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

function registerCodeActions(context: vscode.ExtensionContext) {
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

exports.activate = activate;
