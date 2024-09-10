import { Editor, Menu, ObsidianProtocolData, Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	ScriptExecutorSettingTab,
} from "./modals/settingTab";
import { log, logging } from "./lib/logging";
import { ScriptExecutorSettings } from "./types/type";
import EditorExecutorApi from "./api/EditorExecutorApi";
import BlockExecutorApi from "./api/BlockExecutorApi";
import ProtocolExecutorApi from "./api/ProtocolExecutorApi";

export const PLUGIN_ID = "se";
export default class ScriptExecutor extends Plugin {
	settings: ScriptExecutorSettings;
	statusBar: HTMLElement;
	commands: any[];
	async onload() {
		logging.registerConsoleLogger();
		log(
			"info",
			`loading plugin "${this.manifest.name}" v${this.manifest.version}`
		);
		await this.loadSettings();
		this.registerCommands();
		this.registerProtocolHandlers();
		this.registerContextMenus();
		this.registerCodeBlocks();
		this.addSettingTab(new ScriptExecutorSettingTab(this, this.app));
	}

	registerCommands() {}

	registerProtocolHandlers() {
		this.settings.protocolFuncs.forEach(async (f) => {
			if (f.type === "script") {
				const identifier = PLUGIN_ID + "-" + f.identifier;
				this.registerObsidianProtocolHandler(
					identifier,
					async (params: ObsidianProtocolData) => {
						const api = new ProtocolExecutorApi(params, this.app);
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
							this.app
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
								selection,
								editor,
								this.app
							);
							menu.addItem((item) => {
								item.setIcon(f.icon)
									.setTitle(f.name)
									.onClick(async () => {
										const userScripts =
											await this.getUserScript(f.path);
										const res = await userScripts(api);
										console.log(res);
									});
							});
						}
					)
				);
			}
		});
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
