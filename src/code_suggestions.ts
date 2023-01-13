import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from 'openai';
import * as path from 'path';
import * as fs from 'fs';

async function generateCode(jsonContent: any): Promise<void> {
	// Set up the configuration object
	const configuration = new Configuration({
		organization: jsonContent.organization,
		apiKey: jsonContent.apiKey,
	});

	// Create the OpenAIApi object
	const openai = new OpenAIApi(configuration);
	// Set the model to use for code completions
	const model = jsonContent.completion_model;

	// Get the current text editor
	let editor = vscode.window.activeTextEditor;
	if (editor) {
		// Get the position of the last line of the highlighted text
		let selection = editor.selection;
		let lastLine = selection.end.line;
		// Get the last character of the last line
		let lastChar = editor.document.lineAt(lastLine).range.end;

		//get filepath from the currently open file
		const filePath = editor?.document.uri.fsPath;
		let fileExtension;
		if (filePath) fileExtension = path.extname(filePath);

		// Get the selected text
		const code_snippet = editor?.document.getText(selection);

		// Get the cursor position
		const cursor_position = selection?.active.character;

		// Modify the prompt to include the cursor position
		const prompt =
			code_snippet?.substring(0, cursor_position) +
			'|' +
			code_snippet?.substring(cursor_position as number) +
			'in' +
			fileExtension;

		console.log(prompt);

		// Get the code completion suggestions
		const response = await openai.createCompletion({
			model: jsonContent.completion_model ? jsonContent.completion_model : 'text-davinci-003',
			prompt,
			max_tokens: 1024,
			temperature: jsonContent.completion_temperature ? jsonContent.completion_temperature : 0,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
			best_of: 1,
			n: 1,
		});

		console.log(response);

		// Insert the suggestions after the last character of the last line
		editor.edit(editBuilder => {
			editBuilder.insert(lastChar, '\n' + response.data.choices[0].text);
		});
	} else {
		vscode.window.showErrorMessage('No text editor is active. Please open a file first.');
	}
}

const getCodeSuggestions = vscode.commands.registerCommand('flaiir.getCodeSuggestions.start', () => {
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
		generateCode(jsonContent);
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

export default getCodeSuggestions;
