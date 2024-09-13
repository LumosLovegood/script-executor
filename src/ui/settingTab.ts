import { App, PluginSettingTab, Setting } from "obsidian";
import ScriptExecutor from "src/main";
import { ScriptExecutorSettings } from "src/types/type";
export const DEFAULT_SETTINGS: ScriptExecutorSettings = {
	scriptFolder: "Scripts",
	editorFuncs: [],
	blockFuncs: [],
	protocolFuncs: [],
	llm: {
		selected: "none",
		available: {},
		streamDelay: 100,
	},
};
export class ScriptExecutorSettingTab extends PluginSettingTab {
	cookies = "";
	constructor(readonly plugin: ScriptExecutor, readonly app: App) {
		super(app, plugin);
	}

	async display(): Promise<void> {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h1", {
			text: `${this.plugin.manifest.name}`,
		});
		const span = containerEl.createSpan();
		span.style.fontSize = "1em";
		span.innerHTML = `Version ${this.plugin.manifest.version} <br /> ${this.plugin.manifest.description} created by <a href=${this.plugin.manifest.authorUrl}>${this.plugin.manifest.author}</a>. <br /> Github: <a href="">Github</a>`;
	}
	async hide() {
		this.plugin.loadSettings();
	}
}
