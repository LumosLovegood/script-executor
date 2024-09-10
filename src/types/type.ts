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

export interface ScriptExecutorSettings {
	scriptFolder: string;
	editorFuncs: EditorFunc[];
	blockFuncs: BlockFunc[];
	protocolFuncs: ProtocolFunc[];
}
