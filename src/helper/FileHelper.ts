import { App, TFile } from "obsidian";

export default class FileHelper {
	constructor(private readonly app: App) {}
	async exist(path: string) {
		return this.app.vault.adapter.exists(path);
	}

	async create(filePath: string, content: string) {
		if (await this.exist(filePath)) {
			throw new Error("File already exists");
		}
		return this.app.vault.create(filePath, content);
	}

	async append(file: TFile, content: string) {
		await this.app.vault.append(file, content);
		return file;
	}
}
