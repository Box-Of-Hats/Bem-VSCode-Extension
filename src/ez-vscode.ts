import * as vscode from "vscode";

/**
 * Safely get a configuration value from user settings
 *
 * @param configName The name of the setting value.
 * @param fallBackValue The value to use if no configuration is found.
 */
export function getConfigValue<T>(configName: string, fallBackValue: T): T {
	let settingValue = vscode.workspace.getConfiguration().get(configName) as T;

	return settingValue !== undefined ? settingValue : fallBackValue;
}
