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
	icon?: string;
}

export interface EditorFunc extends ClickableFunc {
	alwaysShow?: boolean;
}

export interface CommandFunc extends ClickableFunc {
	id: string;
	hotkeys?: Hotkey[];
}

export interface BlockFunc extends BaseFunc {
	id: string;
	css?: string;
}

export interface ProtocolFunc extends BaseFunc {
	id: string;
}

export interface LLMConifg {
	apiKey: string;
	endpoint: string;
	model?: string;
}
export interface LLMMap {
	[key: string]: LLMConifg;
}

export interface LLMInfo {
	selected: string;
	map: LLMMap;
}

export interface LLM {
	predict: (messages: LLMChatMessage[]) => Promise<string>;
	stream: (
		messages: LLMChatMessage[]
	) => Promise<ReadableStreamDefaultReader<Uint8Array>>;
}
export interface ScriptExecutorSettings {
	scriptFolder: string;
	editorFuncs: EditorFunc[];
	fileFuncs: ClickableFunc[];
	blockFuncs: BlockFunc[];
	protocolFuncs: ProtocolFunc[];
	commandFuncs: CommandFunc[];
	llm: LLMInfo;
}
export interface Palette {
	light: string[];
	dark: string[];
}

export type LLMChatCallback = (word: string) => void;
export type LLMChatRole = "system" | "assistant" | "user";
export interface LLMChatParams {
	// question: string;
	stream?: boolean;
	useHistory?: boolean;
	callback?: LLMChatCallback;
	delay?: number;
}
export interface LLMChatMessage {
	role: LLMChatRole;
	content: string;
}
export interface ZhipuResponse {
	choices: {
		finish_reason: string;
		index: number;
		message: LLMChatMessage;
	}[];
}
