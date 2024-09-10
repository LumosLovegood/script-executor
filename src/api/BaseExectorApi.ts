import { App, normalizePath, TFile } from "obsidian";
import { formatFileName } from "src/utils/formats";

export default class BaseExecutorApi {
	constructor(private readonly app: App) {}
	async createNote(
		folder: string,
		name: string,
		content: string,
		open: boolean
	): Promise<void> {
		const fileName = formatFileName(name, "md");
		const filePath = normalizePath(`${folder}/${fileName}`);
		if (await this.exist(filePath)) {
			throw new Error("File already exists");
		}
		const file = await this.create(filePath, content);
		if (open) {
			this.app.workspace.getLeaf(true).openFile(file);
		}
	}
	async exist(path: string) {
		return this.app.vault.adapter.exists(path);
	}
	async create(filePath: string, content: string) {
		return this.app.vault.create(filePath, content);
	}
	async append(file: TFile, content: string) {
		await this.app.vault.append(file, content);
		return file;
	}
}
