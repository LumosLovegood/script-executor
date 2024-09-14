import { App, Editor, EditorPosition } from "obsidian";

export default class EditorHelper {
	private editor: Editor | undefined;
	private from: EditorPosition | undefined;
	private to: EditorPosition | undefined;
	constructor(private readonly app: App) {}

	private getEditor() {
		this.editor = this.app.workspace.activeEditor?.editor;
		if (!this.editor) {
			throw new Error("No editor found");
		}
		return this.editor;
	}

	getSelection() {
		const selection = this.getEditor()?.getSelection();
		if (selection && selection.length > 0) {
			return selection;
		}
		return this.getEditor().getLine(this.getEditor().getCursor().line);
	}

	flagPos(type: "from" | "to") {
		const cursor = this.getEditor().getCursor("to");
		if (type === "from") {
			this.from = cursor;
		} else {
			this.to = cursor;
		}
	}

	clearRange() {
		const editor = this.getEditor();
		if (!editor) {
			return;
		}
		this.from && this.to && editor.replaceRange("", this.from, this.to);
		this.from = this.to = undefined;
	}

	insertBlankLine(count = 1) {
		if (!this.getEditor() || !this.editor) {
			return;
		}
		const startPos = this.editor.getCursor("to");
		this.editor.setCursor(startPos);
		this.editor.focus();
		const blank = startPos.ch === 0 ? "" : "\n";
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
		this.insertBlankLine(0);
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
