import { FuzzySuggestModal, App } from "obsidian";
import { t } from "src/lib/lang";

export class Suggester extends FuzzySuggestModal<any> {
	private resolvePromise: (value: any) => void;
	private rejectPromise: (reason?: string) => void;
	emptyStateText = t("NothingFound");
	public promise: Promise<any>;
	private resolved: boolean;
	static build(items: any[], app: App) {
		const suggeter = new Suggester(items, app);
		return suggeter.promise;
	}
	constructor(private items: any[], app: App) {
		super(app);
		this.promise = new Promise<any>((resolve, reject) => {
			this.resolvePromise = resolve;
			this.rejectPromise = reject;
		});
		this.open();
	}
	getItems(): any[] {
		return this.items;
	}
	getItemText(item: any): string {
		return item.text;
	}
	onChooseItem(item: any, evt: MouseEvent | KeyboardEvent): void {
		this.resolved = true;
		this.resolvePromise({ ...item });
	}
	onClose(): void {}
}
