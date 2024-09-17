import { App, Editor, EditorPosition } from "obsidian";

export default class EditorHelper {
	private from: EditorPosition | undefined;
	private to: EditorPosition | undefined;
	constructor(private readonly app: App) {}

	private getEditor(): Editor {
		const editor = this.app.workspace.activeEditor?.editor;
		if (!editor) {
			throw new Error("No editor found");
		}
		return editor;
	}

	getSelection() {
		const editor = this.getEditor();
		const selection = editor.getSelection();
		if (selection && selection.length > 0) {
			return selection;
		}
		const line = editor.getCursor().line;
		const lineText = editor.getLine(line);
		editor.setCursor(line, lineText.length);
		return lineText;
	}

	flagPos(type: "from" | "to") {
		const cursor = this.getEditor().getCursor("to");
		if (type === "from") {
			this.from = cursor;
		} else {
			this.to = cursor;
		}
	}

	undo() {
		const editor = this.getEditor();
		this.from && this.to && editor.replaceRange("", this.from, this.to);
		this.from = this.to = undefined;
	}

	insertBlankLine(count = 1) {
		const editor = this.getEditor();
		const pos = editor.getCursor("to");
		editor.setCursor(pos);
		editor.focus();
		const blank = pos.ch === 0 ? "" : "\n";
		editor.replaceSelection(blank);
		for (let i = 0; i < count; i++) {
			editor.replaceSelection("\n");
		}
	}

	insert(text: string) {
		const editor = this.getEditor();
		editor.replaceSelection(text);
	}

	typeWriter(char: string) {
		const editor = this.getEditor();
		editor.replaceSelection(char);
		editor.scrollIntoView(
			{
				from: editor.getCursor("from"),
				to: editor.getCursor("to"),
			},
			true
		);
	}
}
