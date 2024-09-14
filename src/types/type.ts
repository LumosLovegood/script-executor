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

export interface EditorFunc extends ClickableFunc {
	alwaysShow?: boolean;
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
	editorFuncs: EditorFunc[];
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
	chat: (chatParams: LLMChatParams) => Promise<string>;
	clearHistory: () => void;
	retry: () => Promise<string>;
}

export type LLMChatType = "chat" | "streamChat";
export type LLMChatCallback = (word: string) => void;
export interface LLMChatParams {
	question: string;
	type?: LLMChatType;
	useHistory?: boolean;
	callback?: LLMChatCallback;
	delay?: number;
}
export interface LLMChatMessage {
	role: "system" | "assistant" | "user";
	content: string;
}
export interface ZhipuResponse {
	choices: {
		finish_reason: string;
		index: number;
		message: LLMChatMessage;
	}[];
}
