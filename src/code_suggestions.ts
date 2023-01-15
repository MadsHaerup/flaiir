import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from 'openai';
import * as path from 'path';

async function generateCode(): Promise<void> {
	const vsconfig = vscode.workspace.getConfiguration();
	let openAI_apiKey = vsconfig.get('openai.apiKey') as string;
	let openAI_organizationID = vsconfig.get('openai.organizationID') as string;
	let openAI_completion_model = vsconfig.get('openai.completion.model') as string;
	let completion_temperature = vsconfig.get('openai.completion.temperature') as number;
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
	const completionModel = openAI_completion_model;

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

		// Get the code completion suggestions
		try {
			const response = await openai.createCompletion({
				model: completionModel ? completionModel : 'text-davinci-003',
				prompt,
				max_tokens: 1024,
				temperature: completion_temperature ? completion_temperature : 0,
				top_p: 1,
				frequency_penalty: 0,
				presence_penalty: 0,
				best_of: 1,
				n: 1,
			});

			// Insert the suggestions after the last character of the last line
			editor.edit(editBuilder => {
				editBuilder.insert(lastChar, '\n' + response.data.choices[0].text);
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

const getCodeSuggestions = vscode.commands.registerCommand('flaiir.getCodeSuggestions', async () => {
	try {
		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: 'Loading code suggestions...',
				cancellable: false,
			},
			async (progress, token) => {
				token.onCancellationRequested(() => {
					console.log('User canceled the long running operation');
				});
				await generateCode();
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

export default getCodeSuggestions;
