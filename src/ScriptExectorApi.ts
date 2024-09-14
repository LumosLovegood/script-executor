import { App, Notice, TAbstractFile } from "obsidian";
import EditorHelper from "src/helper/EditorHelper";
import FileHelper from "src/helper/FileHelper";
import { BaseLLM } from "src/types/type";
import { formatFilePath } from "src/utils/formats";

export default class ScriptExecutorApi {
	private fileHelper: FileHelper;
	private editorHelper: EditorHelper;
	constructor(readonly app: App, private readonly llm: BaseLLM) {
		this.fileHelper = new FileHelper(app);
		this.editorHelper = new EditorHelper(app);
	}
	setFile(file: TAbstractFile | null) {
		this.fileHelper.setFile(file);
	}
	async createNote(
		folder: string,
		name: string,
		content: string,
		open?: boolean
	): Promise<void> {
		const filePath = formatFilePath(folder, name);
		const file = await this.fileHelper.create(filePath, content);
		if (open) {
			this.app.workspace.getLeaf(true).openFile(file);
		}
	}

	getSelection() {
		return this.editorHelper.getSelection();
	}

	insertToNextLine(text: string) {
		this.editorHelper.insertToNextLine(text);
	}

	async chat(text: string, useHistory?: boolean) {
		return this.llm.chat(text, useHistory);
	}

	async streamChat(
		text: string,
		callback: (text: string) => void,
		useHistory?: boolean,
		delay = 0
	) {
		return this.llm.streamChat(text, callback, useHistory, delay);
	}

	async typewriterChat(text: string, useHistory?: boolean, delay = 0) {
		this.editorHelper.insertBlankLine();
		new Notice("Typing...");
		await this.llm.streamChat(
			text,
			(char) => this.editorHelper.typeWriter(char),
			useHistory,
			delay
		);
		new Notice("Done!");
		this.editorHelper.insertBlankLine();
	}

	clearChatHistory() {
		this.llm.clearHistory();
		new Notice("Chat history cleared!");
	}
}
