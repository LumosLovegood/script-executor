import { Menu, Plugin } from "obsidian";
import { ScriptExecutorSettingTab } from "./ui/settingTab";
import { log, logging } from "./lib/logging";
import { ScriptExecutorSettings } from "./types/type";
import ScriptExecutorApi from "./ScriptExecutorApi";
import { DEFAULT_SETTINGS } from "./constants";
import { Suggester } from "./ui/suggester";
import ScriptExectorAgent from "./ScriptExecutorAgent";
import { addContextMenu } from "./utils/elements";

export default class ScriptExecutor extends Plugin {
	private seApi: ScriptExecutorApi;
	private agent: ScriptExectorAgent;
	private editorStatusBar: HTMLElement;
	settings: ScriptExecutorSettings;
	commands: any[];

	async onload() {
		this.registerLogger();
		await this.loadSettings();
		this.registerAgent();
		this.registerSriptExecutorApi();
		this.registerSettingTab();
		this.registerCommands();
		this.registerEditorMenus();
		this.registerEditorStatusBar();
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

	registerAgent() {
		this.agent = new ScriptExectorAgent(this.settings.llm);
	}

	registerSriptExecutorApi() {
		this.seApi = new ScriptExecutorApi(this, this.agent);
	}

	registerSettingTab() {
		this.addSettingTab(new ScriptExecutorSettingTab(this));
	}

	registerCommands() {}

	registerEditorMenus() {
		this.registerEvent(
			this.app.workspace.on("editor-menu", async (menu: Menu) => {
				menu.addItem((item) => {
					item.setTitle("Show SE Commands").onClick(async () => {
						const commands = this.getPluginCommands();
						const { id } = await Suggester.build(
							commands,
							this.app
						);
						this.app.commands.executeCommandById(id);
					});
				});
			})
		);
	}

	registerEditorStatusBar() {
		this.editorStatusBar = this.addStatusBarItem();
	}

	setEditorStatusBar(text: string, callback: () => void) {
		const statusBar = this.editorStatusBar;
		statusBar.createEl("span");
		statusBar.setText(text);
		statusBar.onclick = callback;
		addContextMenu(statusBar, {
			Retry: () => this.seApi.retryEditorChat(),
			Undo: () => this.seApi.undoEditorChat(),
		});
		this.editorStatusBar = statusBar;
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	getPluginCommands() {
		if (this.commands) return this.commands;
		this.commands = this.app.commands
			.listCommands()
			.filter((i: any) => i.id.startsWith(this.manifest.id))
			.map((i: any) => {
				return {
					id: i.id,
					text: i.name.replace(this.manifest.name + ": ", ""),
				};
			});
		return this.commands;
	}

	onunload() {
		log(
			"info",
			`unloading plugin "${this.manifest.name}" v${this.manifest.version}`
		);
	}
}
