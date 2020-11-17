import assert = require("assert");
import { BemHelper } from "../../BemHelper";
import { defaultClassNameProviders } from "../../classNameProviders";
import * as vscode from "vscode";

/**
 * Check if two diagnostic lists are matching
 *
 * @param actual
 * @param expected
 */
export const areSameDiagnostics = (
	actual: vscode.Diagnostic[],
	expected: vscode.Diagnostic[]
) => {
	expected.forEach((expectedDiagnostic, index) => {
		const actualDiagnostic = actual[index];

		assert.ok(
			actualDiagnostic.range.isEqual(expectedDiagnostic.range),
			`Range did not match at index ${index}.`
		);

		assert.strictEqual(
			actualDiagnostic.severity,
			expectedDiagnostic.severity,
			`Severity not equal at index ${index}.`
		);
		assert.strictEqual(
			actualDiagnostic.message,
			expectedDiagnostic.message,
			`Message not equal at index ${index}`
		);
	});
	assert.strictEqual(
		actual.length,
		expected.length,
		`Expected (${expected.length}) and actual (${actual.length}) had different number of diagnostics.`
	);
};

/** Helper function to initialise a new BemHelper object */
export const newBemHelper = () => {
	const bemHelper = new BemHelper();
	defaultClassNameProviders.forEach((provider) => {
		bemHelper.registerClassNameProvider(provider);
	});
	return bemHelper;
};
