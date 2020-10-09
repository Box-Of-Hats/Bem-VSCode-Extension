import assert = require("assert");
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
	assert.strictEqual(
		actual.length,
		expected.length,
		"Expected and actual had different number of diagnostics."
	);
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
};
