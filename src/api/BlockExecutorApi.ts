import { App, MarkdownPostProcessorContext } from "obsidian";
import BaseExecutorApi from "./BaseExectorApi";
import { BaseLLM, Palette } from "src/types/type";

export default class BlockExecutorApi extends BaseExecutorApi {
	readonly palette: Palette;
	constructor(
		readonly src: string,
		readonly el: HTMLElement,
		readonly ctx: MarkdownPostProcessorContext,
		app: App,
		llm: BaseLLM
	) {
		super(app, llm);
	}
}
