import { App, Notice, TAbstractFile } from "obsidian";
import EditorHelper from "src/helper/EditorHelper";
import FileHelper from "src/helper/FileHelper";
import { BaseLLM, LLMChatParams } from "src/types/type";
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

	async chat(chatParams: LLMChatParams) {
		return this.llm.chat(chatParams);
	}

	async retryChat() {
		this.editorHelper.clearRange();
		return this.llm.retry();
	}

	async typewriterChat(chatParams: LLMChatParams) {
		this.editorHelper.insertBlankLine(1);
		this.editorHelper.flagPos("from");
		new Notice("Typing...");
		await this.chat({
			...chatParams,
			type: "streamChat",
			callback: (ch) => this.editorHelper.typeWriter(ch),
		});
		new Notice("Done!");
		this.editorHelper.insertBlankLine(0);
		this.editorHelper.flagPos("to");
	}

	clearChatHistory() {
		this.llm.clearHistory();
		new Notice("Chat history cleared!");
	}
}
