import { ButtonComponent, Notice, PluginSettingTab, Setting } from "obsidian";
import ScriptExecutor from "src/main";

export class ScriptExecutorSettingTab extends PluginSettingTab {
	cookies = "";
	constructor(readonly plugin: ScriptExecutor) {
		super(plugin.app, plugin);
	}

	async display(): Promise<void> {
		this.addIntroduction();
		this.addHeader("h3", "Scripts Setting");
		this.addCommandSetting();
		this.addEditorSetting();
		this.addFileMenuSetting();
		this.addBlockSetting();
		this.addProtocolSetting();
		this.addHeader("h3", "AI Setting");
	}

	addIntroduction() {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h1", {
			text: `${this.plugin.manifest.name}`,
		});
		const span = containerEl.createSpan();
		span.style.fontSize = "1em";
		span.innerHTML = `Version ${this.plugin.manifest.version} <br /> ${this.plugin.manifest.description} created by <a href=${this.plugin.manifest.authorUrl}>${this.plugin.manifest.author}</a>. <br /> Github: <a href="https://github.com/LumosLovegood">Github</a>`;
	}

	addHeader(level: "h3" | "h4" | "h5", text: string) {
		this.containerEl.createEl(level, { text });
	}

	addCommandSetting() {
		this.addHeader("h4", "Command Script Setting");
		const commandDesc =
			"Command Scripts will be executed when the command is triggered";
		new Setting(this.containerEl)
			.setName("Command Scripts")
			.setDesc(commandDesc)
			.addButton((button: ButtonComponent) => {
				button
					.setTooltip("Add additional Command Script")
					.setButtonText("+")
					.setCta()
					.onClick(() => {
						this.plugin.settings.commandFuncs.push({
							type: "script",
							path: "",
							name: "",
							id: "",
						});
						this.plugin.saveSettings();
						this.display();
					});
			});
		this.plugin.settings.commandFuncs.forEach((f, index) => {
			const s = new Setting(this.containerEl)
				.addText((text) => {
					text.setValue(
						this.plugin.settings.commandFuncs[index].name
					).onChange((value) => {
						if (value === "") {
							new Notice("Name cannot be empty");
						}
						this.plugin.settings.commandFuncs[index].name = value;
						this.plugin.saveSettings();
					});
				})
				.addText((text) => {
					text.setValue(
						this.plugin.settings.commandFuncs[index].id
					).onChange((value) => {
						if (value === "") {
							new Notice("Id cannot be empty");
						}
						this.plugin.settings.commandFuncs[index].id = value;
						this.plugin.saveSettings();
					});
				})
				.addSearch((cb) => {
					cb.inputEl;
					cb.setPlaceholder("Script")
						.setValue(f.path)
						.onChange((path) => {
							this.plugin.settings.commandFuncs[index].path =
								path;
							this.plugin.saveSettings();
						});
				})
				.addExtraButton((cb) => {
					cb.setIcon("cross")
						.setTooltip("Delete")
						.onClick(() => {
							this.plugin.settings.commandFuncs.splice(index, 1);
							this.plugin.saveSettings();
							this.display();
						});
				});
			s.infoEl.remove();
		});
	}

	addEditorSetting() {
		this.addHeader("h4", "Editor Script Setting");
		const desc =
			"Command Scripts will be executed when the command is triggered";
		new Setting(this.containerEl)
			.setName("Editor Scripts")
			.setDesc(desc)
			.addButton((button: ButtonComponent) => {
				button
					.setTooltip("Add additional Editor Script")
					.setButtonText("+")
					.setCta()
					.onClick(() => {
						this.plugin.settings.editorFuncs.push({
							type: "script",
							path: "",
							name: "",
						});
						this.plugin.saveSettings();
						this.display();
					});
			});
		this.plugin.settings.editorFuncs.forEach((f, index) => {
			const s = new Setting(this.containerEl)
				.addText((text) => {
					text.setValue(
						this.plugin.settings.editorFuncs[index].name
					).onChange((value) => {
						if (value === "") {
							new Notice("Name cannot be empty");
						}
						this.plugin.settings.editorFuncs[index].name = value;
						this.plugin.saveSettings();
					});
				})
				.addSearch((cb) => {
					cb.inputEl;
					cb.setPlaceholder("Script")
						.setValue(f.path)
						.onChange((path) => {
							this.plugin.settings.editorFuncs[index].path = path;
							this.plugin.saveSettings();
						});
				})
				.addExtraButton((cb) => {
					cb.setIcon("cross")
						.setTooltip("Delete")
						.onClick(() => {
							this.plugin.settings.editorFuncs.splice(index, 1);
							this.plugin.saveSettings();
							this.display();
						});
				});
			s.infoEl.remove();
		});
	}

	addFileMenuSetting() {
		const settingName = "FileMenu";
		const settingId = "fileFuncs";
		this.addHeader("h4", `${settingName} Script Setting`);
		const desc =
			"Command Scripts will be executed when the command is triggered";
		new Setting(this.containerEl)
			.setName(`${settingName} Scripts`)
			.setDesc(desc)
			.addButton((button: ButtonComponent) => {
				button
					.setTooltip(`Add additional ${settingName} Script`)
					.setButtonText("+")
					.setCta()
					.onClick(() => {
						this.plugin.settings[settingId].push({
							type: "script",
							path: "",
							name: "",
						});
						this.plugin.saveSettings();
						this.display();
					});
			});
		this.plugin.settings[settingId].forEach((f, index) => {
			const s = new Setting(this.containerEl)
				.addText((text) => {
					text.setValue(
						this.plugin.settings[settingId][index].name
					).onChange((value) => {
						if (value === "") {
							new Notice("Name cannot be empty");
						}
						this.plugin.settings[settingId][index].name = value;
						this.plugin.saveSettings();
					});
				})
				.addSearch((cb) => {
					cb.inputEl;
					cb.setPlaceholder("Script")
						.setValue(f.path)
						.onChange((path) => {
							this.plugin.settings[settingId][index].path = path;
							this.plugin.saveSettings();
						});
				})
				.addExtraButton((cb) => {
					cb.setIcon("cross")
						.setTooltip("Delete")
						.onClick(() => {
							this.plugin.settings[settingId].splice(index, 1);
							this.plugin.saveSettings();
							this.display();
						});
				});
			s.infoEl.remove();
		});
	}

	addBlockSetting() {
		const settingName = "CodeBlock";
		const settingId = "blockFuncs";
		this.addHeader("h4", `${settingName} Script Setting`);
		const desc =
			"Command Scripts will be executed when the command is triggered";
		new Setting(this.containerEl)
			.setName(`${settingName} Scripts`)
			.setDesc(desc)
			.addButton((button: ButtonComponent) => {
				button
					.setTooltip(`Add additional ${settingName} Script`)
					.setButtonText("+")
					.setCta()
					.onClick(() => {
						this.plugin.settings[settingId].push({
							type: "script",
							path: "",
							id: "",
						});
						this.plugin.saveSettings();
						this.display();
					});
			});
		this.plugin.settings[settingId].forEach((f, index) => {
			const s = new Setting(this.containerEl)
				.addText((text) => {
					text.setValue(
						this.plugin.settings[settingId][index].id
					).onChange((value) => {
						if (value === "") {
							new Notice("Name cannot be empty");
						}
						this.plugin.settings[settingId][index].id = value;
						this.plugin.saveSettings();
					});
				})
				.addSearch((cb) => {
					cb.inputEl;
					cb.setPlaceholder("Script")
						.setValue(f.path)
						.onChange((path) => {
							this.plugin.settings[settingId][index].path = path;
							this.plugin.saveSettings();
						});
				})
				.addExtraButton((cb) => {
					cb.setIcon("cross")
						.setTooltip("Delete")
						.onClick(() => {
							this.plugin.settings[settingId].splice(index, 1);
							this.plugin.saveSettings();
							this.display();
						});
				});
			s.infoEl.remove();
		});
	}

	addProtocolSetting() {
		const settingName = "Protocol";
		const settingId = "protocolFuncs";
		this.addHeader("h4", `${settingName} Script Setting`);
		const desc =
			"Command Scripts will be executed when the command is triggered";
		new Setting(this.containerEl)
			.setName(`${settingName} Scripts`)
			.setDesc(desc)
			.addButton((button: ButtonComponent) => {
				button
					.setTooltip(`Add additional ${settingName} Script`)
					.setButtonText("+")
					.setCta()
					.onClick(() => {
						this.plugin.settings[settingId].push({
							type: "script",
							path: "",
							id: "",
						});
						this.plugin.saveSettings();
						this.display();
					});
			});
		this.plugin.settings[settingId].forEach((f, index) => {
			const s = new Setting(this.containerEl)
				.addText((text) => {
					text.setValue(
						this.plugin.settings[settingId][index].id
					).onChange((value) => {
						if (value === "") {
							new Notice("Name cannot be empty");
						}
						this.plugin.settings[settingId][index].id = value;
						this.plugin.saveSettings();
					});
				})
				.addSearch((cb) => {
					cb.inputEl;
					cb.setPlaceholder("Script")
						.setValue(f.path)
						.onChange((path) => {
							this.plugin.settings[settingId][index].path = path;
							this.plugin.saveSettings();
						});
				})
				.addExtraButton((cb) => {
					cb.setIcon("cross")
						.setTooltip("Delete")
						.onClick(() => {
							this.plugin.settings[settingId].splice(index, 1);
							this.plugin.saveSettings();
							this.display();
						});
				});
			s.infoEl.remove();
		});
	}

	async hide() {
		this.plugin.loadSettings();
	}
}
