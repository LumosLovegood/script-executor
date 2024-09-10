import { App, ObsidianProtocolData } from "obsidian";
import BaseExecutorApi from "./BaseExectorApi";

export default class ProtocolExecutorApi extends BaseExecutorApi {
	constructor(readonly param: ObsidianProtocolData, app: App) {
		super(app);
	}
}
