import * as vscode from 'vscode';
import editCode from './code_edit';
import getCodeSuggetions from './code_suggestions';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(getCodeSuggetions);
	context.subscriptions.push(editCode);
}
