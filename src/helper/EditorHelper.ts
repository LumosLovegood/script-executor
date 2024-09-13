import { App, Editor } from "obsidian";

export default class EditorHelper {
	private editor: Editor | undefined;
	constructor(private readonly app: App) {}

	private getEditor() {
		if (!this.editor) {
			this.editor = this.app.workspace.activeEditor?.editor;
		}
		if (!this.editor) {
			throw new Error("No editor found");
		}
		return this.editor;
	}

	getSelection() {
		return this.getEditor()?.getSelection();
	}

	insertBlankLine(count = 1) {
		if (!this.getEditor() || !this.editor) {
			return;
		}
		const pos = this.editor.getCursor("to");
		this.editor.setCursor(pos);
		this.editor.focus();
		const blank = pos.ch === 0 ? "" : "\n";
		this.editor.replaceSelection(blank);
		for (let i = 0; i < count; i++) {
			this.editor.replaceSelection("\n");
		}
	}

	insertToNextLine(text: string) {
		if (!this.getEditor() || !this.editor) {
			return;
		}
		this.insertBlankLine();
		this.editor.replaceSelection(text);
		this.insertBlankLine();
	}

	typeWriter(char: string) {
		if (!this.getEditor() || !this.editor) {
			return;
		}
		this.editor.replaceSelection(char);
		this.editor.scrollIntoView(
			{
				from: this.editor.getCursor("from"),
				to: this.editor.getCursor("to"),
			},
			true
		);
	}
}
