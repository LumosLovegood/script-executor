import {
	Editor,
	Menu,
	ObsidianProtocolData,
	Plugin,
	TAbstractFile,
	WorkspaceLeaf,
} from "obsidian";
import { DEFAULT_SETTINGS, ScriptExecutorSettingTab } from "./ui/settingTab";
import { log, logging } from "./lib/logging";
import { BaseLLM, ScriptExecutorSettings } from "./types/type";
import EditorExecutorApi from "./api/EditorExecutorApi";
import BlockExecutorApi from "./api/BlockExecutorApi";
import ProtocolExecutorApi from "./api/ProtocolExecutorApi";
import ZhipuLLM from "./llm/ZhipuLLM";

export const PLUGIN_ID = "se";
export default class ScriptExecutor extends Plugin {
	settings: ScriptExecutorSettings;
	statusBar: HTMLElement;
	commands: any[];
	llm: BaseLLM;

	async onload() {
		this.registerLogger();
		await this.loadSettings();
		this.registerLLM();
		this.registerCommands();
		this.registerProtocolHandlers();
		this.registerContextMenus();
		this.registerCodeBlocks();
		this.registerSettingTab();
	}

	registerLogger() {
		logging.registerConsoleLogger();
		log(
			"info",
			`loading plugin "${this.manifest.name}" v${this.manifest.version}`
		);
	}

	registerLLM() {
		const selectedLLM = this.settings.llm.selected;
		if (selectedLLM === "zhipu") {
			this.llm = new ZhipuLLM(
				{
					...this.settings.llm.available.zhipu,
					delay: this.settings.llm.streamDelay,
				},
				this.app
			);
		}
	}

	registerCommands() {}

	registerProtocolHandlers() {
		this.settings.protocolFuncs.forEach(async (f) => {
			if (f.type === "script") {
				const identifier = PLUGIN_ID + "-" + f.identifier;
				this.registerObsidianProtocolHandler(
					identifier,
					async (params: ObsidianProtocolData) => {
						const api = new ProtocolExecutorApi(
							params,
							this.app,
							this.llm
						);
						const userFunc = await this.getUserScript(f.path);
						userFunc(api);
					}
				);
			}
		});
	}

	registerCodeBlocks() {
		this.settings.blockFuncs.forEach(async (f) => {
			if (f.type === "script") {
				const identifier = PLUGIN_ID + "-" + f.identifier;
				this.registerMarkdownCodeBlockProcessor(
					identifier,
					async (src, el, ctx) => {
						const api = new BlockExecutorApi(
							src,
							el,
							ctx,
							this.app,
							this.llm
						);
						const userFunc = await this.getUserScript(f.path);
						userFunc(api);
					}
				);
			}
		});
	}

	registerContextMenus() {
		this.settings.editorFuncs.forEach(async (f) => {
			if (f.type === "script") {
				this.registerEvent(
					this.app.workspace.on(
						"editor-menu",
						async (menu: Menu, editor: Editor) => {
							const selection = editor.getSelection();
							if (selection === "") {
								return;
							}
							const api = new EditorExecutorApi(
								editor,
								this.app,
								this.llm
							);
							menu.addItem((item) => {
								item.setIcon(f.icon)
									.setTitle(f.name)
									.onClick(async () => {
										const userScripts =
											await this.getUserScript(f.path);
										const res = await userScripts(api);
										log(
											"info",
											`Running: ${f.path}: ${res}`
										);
									});
							});
						}
					)
				);
			}
		});
	}

	registerSettingTab() {
		this.addSettingTab(new ScriptExecutorSettingTab(this, this.app));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	onunload() {
		log(
			"info",
			`unloading plugin "${this.manifest.name}" v${this.manifest.version}`
		);
	}

	async getUserScript(path: string) {
		const req = (s: string) => window.require && window.require(s);
		const exp: Record<string, any> = {};
		const mod = { exports: exp };
		const scriptContents = await this.readScript(path);
		const func = window.eval(scriptContents);
		func(req, mod, exp);
		const userScripts = exp.default || mod.exports;
		return userScripts;
	}

	async readScript(path: string) {
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
