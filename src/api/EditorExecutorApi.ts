import { App, Editor, EditorPosition, EditorRange, Notice } from "obsidian";
import BaseExecutorApi from "./BaseExectorApi";
import { BaseLLM } from "src/types/type";

export default class EditorExecutorApi extends BaseExecutorApi {
	readonly selection: string;
	readonly selectRange: EditorRange;

	constructor(private readonly editor: Editor, app: App, llm: BaseLLM) {
		super(app, llm);
		this.selection = this.editor.getSelection();
		this.selectRange = {
			from: this.editor.getCursor("from"),
			to: this.editor.getCursor("to"),
		};
	}

	insertToNextLine(text: string) {
		this.insertBlankLine();
		this.editor.replaceSelection(text);
	}

	insertBlankLine(count = 1) {
		const pos = this.editor.getCursor("to");
		this.editor.setCursor(pos);
		this.editor.focus();
		const blank = pos.ch === 0 ? "" : "\n";
		this.editor.replaceSelection(blank);
		for (let i = 0; i < count; i++) {
			this.editor.replaceSelection("\n");
		}
	}

	async typewriterChat(text: string) {
		this.insertBlankLine();
		new Notice("Typing...");
		await this.llm.chatStream(text, (chunk) => {
			this.editor.replaceSelection(chunk);
			this.editor.scrollIntoView(
				{
					from: this.editor.getCursor("from"),
					to: this.editor.getCursor("to"),
				},
				true
			);
		});
		new Notice("Done!");
	}
}
