![flaiir](/images/banner.png)

An AI tool that utilizes the OpenAI API to provide code suggestions for the user based on the current text editor's selection and file type.

---

## Features

- Generate ai code from a highlighted comment.
- Shown in a pretty code format.
- Has ‘Copy to clipboard’ functionality.
- Auto detecting your current file extension (.js, .ts, .py etc..) to deliver the code in the right format.

---

## **Requirements**

- Create a free account on [https://beta.openai.com/](https://beta.openai.com/), you will start with 18$ in free credit that can be used during your first 3 months.

- Create a flaiir.config.json file, populate the file with your API Key, Organization ID which can be found under settings and API Keys, and the model you wish yo use, the model can be found here [https://beta.openai.com/docs/models/gpt-3](https://beta.openai.com/docs/models/gpt-3)

```js
flaiir.config.js

{
  "organization": "YOUR-ORGINIZATION-ID",
  "apiKey": "YOUR-API-KEY"
  "model":"text-davinci-003"
}
```

---

## How to use

- Install extension

- Highlight the comment your want to generate code from

For example, write the following comment in a file and hightlight it with your mouse.

```js
// create a fetch function with async/await
```

Then

- Open command palette: **shift + command + p** and type “flaiir get code suggestions” and hit the _Enter key_

- Wait for the code to be generated. It will open up in new tab.
