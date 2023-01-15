![flaiir](/images/banner.png)
An AI tool that utilizes the OpenAI API to generate code suggestions, fixes spelling mistakes, refactor existing code and explains code for the user, based on the current text editors selection and file type.

---

## Features

- Generate code from a highlighted comment/code.
  - Shown inline under the highlighted comment/code.
- Explain code.
- Refactor code.
- Auto detecting your current file extension (.js, .ts, .py etc..) to deliver the code in the correct format.
- Quickly fix spelling mistakes in comments, Markdown and text files.

---

## **Requirements**

- Create a free account on [https://beta.openai.com/](https://beta.openai.com/), you will start with 18$ in free credit that can be used during your first 3 months.

- Go to flaiir workspace settings
  ![settings](/images/settings.png)
- Your API Key, can be found here: [https://beta.openai.com/account/api-keys](https://beta.openai.com/account/api-keys)
- Organization ID can be found here [https://beta.openai.com/account/org-settings](https://beta.openai.com/account/org-settings)
- The models you wish to use, the models can be found here [https://beta.openai.com/docs/models/gpt-3](https://beta.openai.com/docs/models/gpt-3)
- Temperature, a value between 0-1.

---

## How to use

- Install extension

## TL;DR

```txt
Highlight the comment/code you want to generate/explain/refactor some code or text from.

Open command palette:

shift + command + p

Commands:

flaiir generator/explainer
	* Generates code and explains code

flaiir refactor
  *  This command refactors code and fixes spelling mistakes
```

---

### Generate code

- Highlight the comment/code your want to generate code from

For example, write the following comment in a file and hightlight it with your mouse.

Input:

```js
// create a fetch function with async/await
```

Then

- Open command palette: **shift + command + p** and type “flaiir generator/explainer” and hit the _Enter key_

- Wait for the code to be generated...

Output:

```js
const fetchData = async url => {
	try {
		const response = await fetch(url);
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error);
	}
};
```

---

### Refactor

Input:

```js
//change fetchdata to use then instead of async/await
const fetchData = async url => {
	try {
		const response = await fetch(url);
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error);
	}
};
```

- Open command palette: **shift + command + p** and type “flaiir refactor” and hit the _Enter key_

Output:

```js
const fetchData = url => {
	return fetch(url)
		.then(response => response.json())
		.then(data => data)
		.catch(error => console.log(error));
};
```

---

### Explain code

Input:

```js
// Function 1
var fullNames = [];
for (var i = 0; i < 50; i++) {
	fullNames.push(
		names[Math.floor(Math.random() * names.length)] + ' ' + lastNames[Math.floor(Math.random() * lastNames.length)]
	);
}

// What does Function 1 do?
```

- Highlight all of the above
  - Open command palette: **shift + command + p** and type “flaiir generator/explainer” and hit the _Enter key_

Output:

```js
// Function 1 creates an array of 50 random full names.
```

---

### Fix spelling mistakes

- Provide a one-line instruction, then highlight the instruction and paragraph you want to fix.

Input

```md
fix spelling mistakes

At the start of school Dora was afrad of her new Teacher. Mrs. Davis seamed nice, but she had so manny rules for the class to folow. Scare someone to pieces. As the school year cotinued, Dora begun to understan how the Teacher come up with the rules The rules were their so students would be respecful of theyselves and each other. By the end of the year, Dora though Mrs. Davis was the best Teacher she evere had!
```

Then

- Open command palette: **shift + command + p** and type “flaiir refactor” and hit the _Enter key_

Output

```md
At the start of school Dora was afraid of her new Teacher. Mrs. Davis seemed nice, but she had so many rules for the class to follow. Scare someone to pieces. As the school year continued, Dora began to understand how the Teacher come up with the rules The rules were their so students would be respectful of them selves and each other. By the end of the year, Dora thought Mrs. Davis was the best Teacher she ever had!
```

---
