import { App, TAbstractFile, TFile, TFolder } from "obsidian";

export default class FileHelper {
	private file: TAbstractFile | null;
	constructor(private readonly app: App) {
		this.file = app.workspace.getActiveFile();
	}

	setFile(file: TAbstractFile | null) {
		this.file = file;
	}

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

	async getContent(file = this.file) {
		if (!file || !this.isTFile(file)) {
			return;
		}
		return this.app.vault.cachedRead(file);
	}

	private isTFile(file: TAbstractFile | null): file is TFile {
		return file instanceof TFile;
	}

	private isTFolder(file: TAbstractFile | null): file is TFolder {
		return file instanceof TFolder;
	}
}
