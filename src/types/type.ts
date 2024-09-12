export interface WebViewElement extends HTMLElement {
	loadURL: (url: string) => void;
	getURL: () => string;
	getTitle: () => string;
	executeJavaScript: (script: string, userGesture?: boolean) => Promise<any>;
	isDevToolsOpened: () => boolean;
	openDevTools: () => void;
}

export interface EditorFunc {
	type: "script";
	path: string;
	name: string;
	icon: string;
}

export interface BlockFunc {
	type: "script";
	path: string;
	identifier: string;
	css: string;
}

export interface ProtocolFunc {
	type: "script";
	path: string;
	identifier: string;
}

export interface LLMConifg {
	apiKey: string;
	endpoint: string;
	model?: string;
	delay?: number;
}
export interface ScriptExecutorSettings {
	scriptFolder: string;
	editorFuncs: EditorFunc[];
	blockFuncs: BlockFunc[];
	protocolFuncs: ProtocolFunc[];
	llm: {
		selected: string;
		available: {
			[key: string]: LLMConifg;
		};
		streamDelay?: number;
	};
}

export interface Palette {
	light: string[];
	dark: string[];
}

export interface BaseLLM {
	chat: (prompt: string) => Promise<string>;
	chatStream: (
		prompt: string,
		callback: (word: string) => void
	) => Promise<void>;
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
