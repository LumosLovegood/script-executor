import { App, ObsidianProtocolData } from "obsidian";
import BaseExecutorApi from "./BaseExectorApi";
import { BaseLLM } from "src/types/type";

export default class ProtocolExecutorApi extends BaseExecutorApi {
	constructor(readonly param: ObsidianProtocolData, app: App, llm: BaseLLM) {
		super(app, llm);
	}
}
