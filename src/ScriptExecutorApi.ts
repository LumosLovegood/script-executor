import {
	App,
	Editor,
	Menu,
	Notice,
	ObsidianProtocolData,
	TAbstractFile,
} from "obsidian";
import EditorHelper from "src/helper/EditorHelper";
import FileHelper from "src/helper/FileHelper";
import {
	BlockFunc,
	ClickableFunc,
	CommandFunc,
	EditorFunc,
	LLMChatParams,
} from "src/types/type";
import { formatFilePath, formatId } from "src/utils/formats";
import ScriptExectorAgent from "./ScriptExecutorAgent";
import ScriptExecutor from "./main";
import { log } from "console";
import BlockHandler from "./handler/BlockHandler";

export default class ScriptExecutorApi {
	private fileHelper: FileHelper;
	private editorHelper: EditorHelper;
	readonly app: App;
	constructor(
		readonly se: ScriptExecutor,
		private readonly agent: ScriptExectorAgent
	) {
		this.app = se.app;
		this.fileHelper = new FileHelper(se.app);
		this.editorHelper = new EditorHelper(se.app);
		this._init();
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

	insertText(text: string) {
		this.editorHelper.insert(text);
	}

	insertBlankLine(count?: number) {
		this.editorHelper.insertBlankLine(count);
	}

	async chat(question: string, chatParams?: LLMChatParams) {
		return this.agent.execute(question, chatParams);
	}

	async retryChat() {
		return this.agent.retry();
	}

	undoEditorChat() {
		this.editorHelper.undo();
	}

	async retryEditorChat() {
		this.editorHelper.undo();
		const { question, chatParams } = this.agent.rollback();
		this.editorChat(question, chatParams);
	}

	async editorChat(question: string, chatParams?: LLMChatParams) {
		this.editorHelper.flagPos("from");
		new Notice("Typing...", 2000);
		this.se.setEditorStatusBar("Typing...", () => this.agent.cancel());
		const result = await this.chat(question, {
			...chatParams,
			callback: (ch) => this.editorHelper.typeWriter(ch),
		});
		new Notice("Done!");
		!chatParams?.stream && this.insertText(result);
		this.editorHelper.flagPos("to");
	}

	clearChatHistory() {
		this.agent.clear();
		new Notice("Chat history cleared!");
	}

	private _init() {
		const {
			commandFuncs,
			fileFuncs,
			editorFuncs,
			blockFuncs,
			protocolFuncs,
		} = this.se.settings;
		commandFuncs.forEach(async (f) => this._loadCommandScripts(f));
		fileFuncs.forEach(async (f) => this._loadFileScripts(f));
		editorFuncs.forEach(async (f) => this._loadEditorScripts(f));
		blockFuncs.forEach(async (f) => this._loadBlockScripts(f));
		protocolFuncs.forEach(async (f) => this._loadProtocolScripts(f));
	}

	private async _loadCommandScripts(config: CommandFunc) {
		if (config.type !== "script") {
			return;
		}
		const id = formatId(config.id);
		this.se.registerObsidianProtocolHandler(
			id,
			async (protocolData: ObsidianProtocolData) => {
				const userFunc = await this._getUserScript(config.path);
				userFunc({ seApi: this, protocolData });
			}
		);
	}

	private async _loadFileScripts(config: ClickableFunc) {
		if (config.type !== "script") {
			return;
		}
		this.se.registerEvent(
			this.app.workspace.on(
				"file-menu",
				async (menu: Menu, file: TAbstractFile) => {
					this._addScriptMenuItem(menu, config);
					this.setFile(file);
				}
			)
		);
	}

	private async _loadEditorScripts(config: EditorFunc) {
		if (config.type !== "script") {
			return;
		}
		this.se.registerEvent(
			this.app.workspace.on(
				"editor-menu",
				async (menu: Menu, editor: Editor) => {
					if (config.alwaysShow || editor.getSelection().length > 0) {
						this._addScriptMenuItem(menu, config);
					}
				}
			)
		);
	}

	private async _loadBlockScripts(config: BlockFunc) {
		if (config.type !== "script") {
			return;
		}
		const id = formatId(config.id);
		this.se.registerMarkdownCodeBlockProcessor(id, async (src, el, ctx) => {
			const userFunc = await this._getUserScript(config.path);
			const blockHandler = new BlockHandler(this, src, el, ctx);
			userFunc({ seApi: this, handler: blockHandler });
		});
	}

	private async _loadProtocolScripts(config: BlockFunc) {
		if (config.type !== "script") {
			return;
		}
		const id = formatId(config.id);
		this.se.registerObsidianProtocolHandler(
			id,
			async (protocolData: ObsidianProtocolData) => {
				const userFunc = await this._getUserScript(config.path);
				userFunc({ seApi: this, protocolData });
			}
		);
	}

	private _addScriptMenuItem(menu: Menu, f: ClickableFunc) {
		menu.addItem((item) => {
			item.setIcon(f?.icon ?? "")
				.setTitle(f.name)
				.onClick(async () => {
					const userScripts = await this._getUserScript(f.path);
					log("info", `Running: ${f.path}`);
					await userScripts({
						seApi: this,
					});
					this.setFile(this.app.workspace.getActiveFile());
				});
		});
	}

	private async _getUserScript(path: string) {
		const req = (s: string) => window.require && window.require(s);
		const exp: Record<string, any> = {};
		const mod = { exports: exp };
		const scriptContents = await this._readScript(path);
		const func = window.eval(scriptContents);
		func(req, mod, exp);
		const userScripts = exp.default || mod.exports;
		return userScripts;
	}

	private async _readScript(path: string) {
		const scriptFile = this.app.metadataCache.getFirstLinkpathDest(
			path,
			""
		);
		if (!scriptFile) {
			return "new Notice(path + 'Not Found.')";
		}
		const contents = await this.app.vault.read(scriptFile);
		return `(function(require, module, exports) { ${contents} })`;
	}
}
