import { App, Editor } from "obsidian";
import BaseExecutorApi from "./BaseExectorApi";
import { BaseLLM } from "src/types/type";

export default class EditorExecutorApi extends BaseExecutorApi {
	readonly selection: string;
	constructor(private readonly editor: Editor, app: App, llm: BaseLLM) {
		super(app, llm);
		this.selection = this.editor.getSelection();
	}
	insertToNextLine(text: string) {
		const { line } = this.editor.getCursor("to");
		const nextLine = line + 2;
		this.editor.setCursor(nextLine, 0);
		this.editor.focus();
		this.editor.replaceSelection(text);
	}
}
