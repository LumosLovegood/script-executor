import { App, MarkdownPostProcessorContext } from "obsidian";
import BaseExecutorApi from "./BaseExectorApi";

export default class BlockExecutorApi extends BaseExecutorApi {
	constructor(
		readonly src: string,
		readonly el: HTMLElement,
		readonly ctx: MarkdownPostProcessorContext,
		app: App
	) {
		super(app);
	}
}
