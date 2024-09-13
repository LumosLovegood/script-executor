import { Hotkey } from "obsidian";

export interface WebViewElement extends HTMLElement {
	loadURL: (url: string) => void;
	getURL: () => string;
	getTitle: () => string;
	executeJavaScript: (script: string, userGesture?: boolean) => Promise<any>;
	isDevToolsOpened: () => boolean;
	openDevTools: () => void;
}

export interface BaseFunc {
	type: "script";
	path: string;
}

export interface ClickableFunc extends BaseFunc {
	name: string;
	icon: string;
}

export interface CommandFunc extends ClickableFunc {
	id: string;
	hotkeys: Hotkey[];
}

export interface BlockFunc extends BaseFunc {
	id: string;
	css: string;
}

export interface ProtocolFunc extends BaseFunc {
	id: string;
}

export interface LLMConifg {
	apiKey: string;
	endpoint: string;
	model?: string;
}
export interface ScriptExecutorSettings {
	scriptFolder: string;
	editorFuncs: ClickableFunc[];
	fileFuncs: ClickableFunc[];
	blockFuncs: BlockFunc[];
	protocolFuncs: ProtocolFunc[];
	commandFuncs: CommandFunc[];
	llm: {
		selected: string;
		available: {
			[key: string]: LLMConifg;
		};
	};
}

export interface Palette {
	light: string[];
	dark: string[];
}

export interface BaseLLM {
	chat: (prompt: string, useHistory?: boolean) => Promise<string>;
	streamChat: (
		prompt: string,
		callback: (word: string) => void,
		useHistory?: boolean,
		delay?: number
	) => Promise<void>;
	clearHistory: () => void;
}

export interface LLMMessage {
	role: string;
	content: string;
}
export interface ZhipuResponse {
	choices: {
		finish_reason: string;
		index: number;
		message: LLMMessage;
	}[];
}
