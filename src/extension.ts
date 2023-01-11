// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import getCodeSuggetions from './code_suggestions';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// This line of code will only be executed once when your extension is activated

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	let disposable = vscode.commands.registerCommand('flaiir.getCodeSuggestions.start', () => {
		// The code you place here will be executed every time your command is executed
		const defaultPath = path.join(require('os').homedir(), 'flaiir.config.json');
		let jsonFile = defaultPath;

		if (vscode.workspace.workspaceFolders !== undefined) {
			jsonFile = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'flaiir.config.json');
		}

		vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: 'Loading file...',
				cancellable: false,
			},
			progress => {
				return new Promise((resolve, reject) => {
					fs.stat(jsonFile, (err, stats) => {
						if (err) {
							reject(err);
							return;
						}
						const totalBytes = stats.size;
						let bytesRead = 0;

						const readStream = fs.createReadStream(jsonFile);
						readStream.on('data', chunk => {
							bytesRead += chunk.length;
							const percentageComplete = (bytesRead / totalBytes) * 100;
							progress.report({
								increment: percentageComplete,
							});
						});
						readStream.on('error', err => {
							reject(err);
						});
						readStream.on('end', () => {
							resolve('File read complete');
							vscode.window.showInformationMessage('Thanks for using flaiir, the code is on the way');
						});
					});
				});
			}
		);
		try {
			const fileContent = fs.readFileSync(jsonFile, 'utf-8');
			const jsonContent = JSON.parse(fileContent);
			getCodeSuggetions(jsonContent);
		} catch (err: any) {
			if (err.code === 'ENOENT') {
				vscode.window.showErrorMessage('flaiir.config.json file not found.');
			} else if (err instanceof SyntaxError) {
				vscode.window.showErrorMessage('flaiir.config.json file is not a valid JSON file.');
			} else {
				vscode.window.showErrorMessage('An error occurred while reading flaiir.config.json file.');
			}
		}

		// Display a message box to the user
		// vscode.window.showInformationMessage('Thanks for using Flaiir, enjoy!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
