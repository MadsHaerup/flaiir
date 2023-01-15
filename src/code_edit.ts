import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from 'openai';
import * as path from 'path';

async function getCodeEdit(): Promise<void> {
	const vsconfig = vscode.workspace.getConfiguration();
	let openAI_apiKey = vsconfig.get('openai.apiKey') as string;
	let openAI_organizationID = vsconfig.get('openai.organizationID') as string;
	let openAI_edit_model = vsconfig.get('openai.edit.model') as string;
	let openAI_edit_temperature = vsconfig.get('openai.edit.temperature') as number;

	if (!openAI_apiKey || !openAI_organizationID) {
		vscode.window.showErrorMessage('Please check your settings, apiKey and organizationID are required.');
		return;
	}
	// Set up the configuration object
	const configuration = new Configuration({
		organization: openAI_organizationID,
		apiKey: openAI_apiKey,
	});

	// Create the OpenAIApi object
	const openai = new OpenAIApi(configuration);
	// Set the model to use for code completions
	const edit_model = openAI_edit_model;
	const edit_temperature = openAI_edit_temperature;

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
		// Get the code edit suggestions
		try {
			const response = await openai.createEdit({
				model: edit_model ? edit_model : 'code-davinci-edit-001',
				input,
				instruction,
				temperature: edit_temperature ? edit_temperature : 0.6,
				top_p: 1,
			});

			// Replace the highlighted text with the suggestions
			editor.edit(editBuilder => {
				editBuilder.replace(selection, response.data.choices[0].text as string);
			});
		} catch (error: any) {
			if (error.response.status === 401) {
				vscode.window.showErrorMessage('The API key and organization ID are not correct or invalid.');
			} else {
				vscode.window.showErrorMessage(error.message);
			}
		}
	} else {
		vscode.window.showErrorMessage('No text editor is active. Please open a file first.');
	}
}
const editCode = vscode.commands.registerCommand('flaiir.getCodeEdit', async () => {
	try {
		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: 'Loading...',
				cancellable: false,
			},
			async (progress, token) => {
				token.onCancellationRequested(() => {
					console.log('User canceled the long running operation');
				});
				await getCodeEdit();
				progress.report({ increment: 100 });
			}
		);
	} catch (err: any) {
		if (err.code === 'ENOENT') {
			vscode.window.showErrorMessage('settings.json file not found.');
		} else if (err instanceof SyntaxError) {
			vscode.window.showErrorMessage('settings.json file is not a valid JSON file.');
		} else {
			vscode.window.showErrorMessage('An error occurred while reading settings.json file.');
		}
	}
});

export default editCode;
