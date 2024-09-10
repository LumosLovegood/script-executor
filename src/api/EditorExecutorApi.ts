import { App, Editor } from "obsidian";
import BaseExecutorApi from "./BaseExectorApi";

export default class EditorExecutorApi extends BaseExecutorApi {
	constructor(
		readonly selection: string,
		private readonly editor: Editor,
		app: App
	) {
		super(app);
	}
	insertToNextLine(text: string) {
		const { line } = this.editor.getCursor();
		const nextLine = line + 1;
		this.editor.focus();
		this.editor.setCursor(nextLine, 0);
		this.editor.replaceSelection(text);
	}
}
