import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from 'openai';
import * as path from 'path';
import * as fs from 'fs';

async function getCodeEdit(jsonContent: any): Promise<void> {
	// Set up the configuration object
	const configuration = new Configuration({
		organization: jsonContent.organization,
		apiKey: jsonContent.apiKey,
	});

	// Create the OpenAIApi object
	const openai = new OpenAIApi(configuration);
	// Set the model to use for code completions
	const model = jsonContent.edit_model;

	// Get the current text editor
	let editor = vscode.window.activeTextEditor;
	if (editor) {
		// Get the position of the last line of the highlighted text
		let selection = editor.selection;

		//get filepath from the currently open file
		const filePath = editor?.document.uri.fsPath;
		let fileExtension;
		if (filePath) fileExtension = path.extname(filePath);

		// Modify the prompt to include the cursor position
		const instruction = editor.document.lineAt(selection.start.line).text;
		const input = editor.document.getText(
			new vscode.Range(selection.start.line + 1, 0, selection.end.line, selection.end.character)
		);
		console.log(instruction);
		console.log(input);

		// Get the code edit suggestions
		const response = await openai.createEdit({
			model: jsonContent.edit_model ? jsonContent.edit_model : 'code-davinci-edit-001',
			input,
			instruction,
			temperature: jsonContent.edit_temperature ? jsonContent.edit_temperature : 0.6,
			top_p: 1,
		});

		console.log('RESPONSE', response);
		// Replace the highlighted text with the suggestions
		editor.edit(editBuilder => {
			editBuilder.replace(selection, response.data.choices[0].text as string);
		});
	} else {
		vscode.window.showErrorMessage('No text editor is active. Please open a file first.');
	}
}

let editCode = vscode.commands.registerCommand('flaiir.getCodeEdit.start', () => {
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
		getCodeEdit(jsonContent);
	} catch (err: any) {
		if (err.code === 'ENOENT') {
			vscode.window.showErrorMessage('flaiir.config.json file not found.');
		} else if (err instanceof SyntaxError) {
			vscode.window.showErrorMessage('flaiir.config.json file is not a valid JSON file.');
		} else {
			vscode.window.showErrorMessage('An error occurred while reading flaiir.config.json file.');
		}
	}
});

export default editCode;
