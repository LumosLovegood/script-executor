import {
	Editor,
	Menu,
	ObsidianProtocolData,
	Plugin,
	TAbstractFile,
	WorkspaceLeaf,
} from "obsidian";
import { ScriptExecutorSettingTab } from "./ui/settingTab";
import { log, logging } from "./lib/logging";
import { BaseLLM, ScriptExecutorSettings } from "./types/type";
import ZhipuLLM from "./llm/ZhipuLLM";
import ScriptExecutorApi from "./ScriptExectorApi";
import { DEFAULT_SETTINGS, PLUGIN_ID } from "./constants";

export default class ScriptExecutor extends Plugin {
	private seApi: ScriptExecutorApi;
	settings: ScriptExecutorSettings;
	statusBar: HTMLElement;
	commands: any[];
	llm: BaseLLM;

	async onload() {
		this.registerLogger();
		await this.loadSettings();
		this.registerLLM();
		this.registerSriptExecutorApi();
		this.registerSettingTab();
		this.registerAllScripts();
	}

	registerLogger() {
		logging.registerConsoleLogger();
		log(
			"info",
			`loading plugin "${this.manifest.name}" v${this.manifest.version}`
		);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	registerLLM() {
		const selectedLLM = this.settings.llm.selected;
		if (selectedLLM === "zhipu") {
			this.llm = new ZhipuLLM(this.settings.llm.available.zhipu);
		}
	}

	registerSriptExecutorApi() {
		this.seApi = new ScriptExecutorApi(this.app, this.llm);
	}

	registerSettingTab() {
		this.addSettingTab(new ScriptExecutorSettingTab(this, this.app));
	}

	registerAllScripts() {
		this.registerCommands();
		this.registerProtocolHandlers();
		this.registerFileMenus();
		this.registerEditorMenus();
		this.registerCodeBlocks();
	}

	registerCommands() {
		this.settings.commandFuncs.forEach(async (f) => {
			if (f.type === "script") {
				const id = PLUGIN_ID + "-" + f.id;
				this.addCommand({
					id: id,
					name: f.name,
					icon: f.icon,
					hotkeys: f.hotkeys,
					callback: async () => {
						const userFunc = await this.getUserScript(f.path);
						userFunc({ seApi: this.seApi });
					},
				});
			}
		});
	}

	registerFileMenus() {
		this.settings.fileFuncs.forEach(async (f) => {
			if (f.type === "script") {
				this.registerEvent(
					this.app.workspace.on(
						"file-menu",
						async (
							menu: Menu,
							file: TAbstractFile,
							source: string,
							leaf: WorkspaceLeaf
						) => {
							const userFunc = await this.getUserScript(f.path);
							userFunc({ seApi: this.seApi });
						}
					)
				);
			}
		});
	}

	registerProtocolHandlers() {
		this.settings.protocolFuncs.forEach(async (f) => {
			if (f.type === "script") {
				const identifier = PLUGIN_ID + "-" + f.id;
				this.registerObsidianProtocolHandler(
					identifier,
					async (protocolData: ObsidianProtocolData) => {
						const userFunc = await this.getUserScript(f.path);
						userFunc({ seApi: this.seApi, protocolData });
					}
				);
			}
		});
	}

	registerCodeBlocks() {
		this.settings.blockFuncs.forEach(async (f) => {
			if (f.type === "script") {
				const identifier = PLUGIN_ID + "-" + f.id;
				this.registerMarkdownCodeBlockProcessor(
					identifier,
					async (src, el, ctx) => {
						const userFunc = await this.getUserScript(f.path);
						userFunc({ seApi: this.seApi, src, el, ctx });
					}
				);
			}
		});
	}

	registerEditorMenus() {
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
							menu.addItem((item) => {
								item.setIcon(f.icon)
									.setTitle(f.name)
									.onClick(async () => {
										const userScripts =
											await this.getUserScript(f.path);
										await userScripts({
											seApi: this.seApi,
										});
										log("info", `Running: ${f.path}`);
									});
							});
						}
					)
				);
			}
		});
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
