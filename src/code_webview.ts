import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from 'openai';
import path = require('path');

async function getCodeSuggetions(jsonContent: any): Promise<void> {
	// Set up the configuration object
	const configuration = new Configuration({
		organization: jsonContent.organization,
		apiKey: jsonContent.apiKey,
	});

	// Create the OpenAIApi object
	const openai = new OpenAIApi(configuration);
	// Set the model to use for code completions
	const model = jsonContent.model;

	// Set the prompt to use for code completions
	// Get the current text editor
	let decorationType = vscode.window.createTextEditorDecorationType({
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		before: {
			margin: '-1px',
			contentText: '',
			border: 'solid 2px #28efa8',
		},
	});

	let editor = vscode.window.activeTextEditor;
	if (editor) {
		let selection = editor.selection;
		let decorations = [{ range: selection }];
		console.log(decorations);
		editor.setDecorations(decorationType, decorations);
	}

	//get filepath from the currently open file
	const filePath = editor?.document.uri.fsPath;
	let fileExtension;
	if (filePath) fileExtension = path.extname(filePath);

	// Get the selected text
	const selection = editor?.selection;
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
	console.log(prompt, 'prompt');

	// Get the code completion suggestions
	const response = await openai.createCompletion({
		model,
		prompt,
		max_tokens: 1024,
		temperature: 0,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0,
		best_of: 1,
		n: 1,
	});

	// ** Use Vs code webview **
	const panel = vscode.window.createWebviewPanel('getCodeSuggestions', 'Code suggestions', vscode.ViewColumn.One, {
		enableScripts: true, // Allows scripts in the webview
	});

	panel.webview.html = getWebviewContent();

	function getWebviewContent() {
		return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Suggestions</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
    </head>
    <body>
			<header style="text-align: center; padding: 10px;">
				<h1>Here is the requested code</h1>
				<p style="font-size: smaller;">Click anywhere on the code to copy</p>
			</header>
        <pre>
            <code id="code-element" >
            ${response.data.choices[0].text}		
            </code>
        </pre>
        <script>
            const codeElement = document.getElementById('code-element');
            codeElement.addEventListener('click', () => {
                navigator.clipboard.writeText(codeElement.textContent);
            });
        </script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js" integrity="sha512-bgHRAiTjGrzHzLyKOnpFvaEpGzJet3z4tZnXGjpsCcqOnAH6VGUx9frc5bcIhKTVLEiCO6vEhNAgx5jtLUYrfA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
        <script>hljs.highlightAll();</script>
    </body>
    </html>`;
	}
}

export default getCodeSuggetions;
