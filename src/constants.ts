import { ScriptExecutorSettings } from "./types/type";

export const PLUGIN_ID = "se";

export const DEFAULT_SETTINGS: ScriptExecutorSettings = {
	scriptFolder: "Scripts",
	editorFuncs: [],
	blockFuncs: [],
	protocolFuncs: [],
	fileFuncs: [],
	commandFuncs: [],
	llm: {
		selected: "none",
		map: {},
	},
};
