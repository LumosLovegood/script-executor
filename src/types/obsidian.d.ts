// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as obsidian from "obsidian";
import { EditorPosition, MarkdownPreviewRenderer, Menu } from "obsidian";

declare module "obsidian" {
	export interface ItemView {
		headerEl: HTMLDivElement;
	}

	interface App {
		plugins: {
			getPlugin(name: string): any;
			enabledPlugins: Set<string>;
			getPluginFolder(): string;
		};
		commands: any;
		getTheme: () => string;
		saveLocalStorage: (key: string, value: string) => void;
		loadLocalStorage: (key: string) => string;
		setting: {
			open: () => void;
			openTabById: (id: string) => void;
		};
	}

	interface settings {
		applySettingsUpdate: () => void;
	}

	export interface WorkspaceLeaf {
		id: string;
		group: string | undefined;
		history: {
			backHistory: Array<any>;
			forwardHistory: Array<any>;
		};
		children: WorkspaceLeaf[];
		tabHeaderInnerIconEl: HTMLDivElement;
		tabHeaderInnerTitleEl: HTMLDivElement;
		tabHeaderContainerEl: HTMLDivElement;
		containerEl: HTMLDivElement;
		activeTime: number;
		rebuildView: () => void;
		setDimension: (dimension: any) => void;
		parent: WorkspaceTabs | WorkspaceMobileDrawer;
	}
	export interface WorkspaceRoot {
		children: WorkspaceLeaf[];
		containerEl: HTMLElement;
		direction: "vertical" | "horizontal";
	}
	export interface WorkspaceRibbon {
		hide: () => void;
		show: () => void;
		hidden: boolean;
	}
	export interface WorkspaceItem {
		type: string;
		getLeavesOfType: (type: string) => WorkspaceLeaf[];
		activeEditor: {
			editor: Editor;
			leaf: WorkspaceLeaf;
		};
	}

	interface VaultSettings {
		showViewHeader: boolean;
	}

	export interface Vault {
		config: Record<string, unknown>;
		adater: DataAdapter;
		getConfig<T extends keyof VaultSettings>(setting: T): VaultSettings[T];

		setConfig<T extends keyof VaultSettings>(setting: T, value: any): void;
	}

	export interface DataAdapter {
		basePath: string;
	}
	class MarkdownPreviewRendererStatic extends MarkdownPreviewRenderer {
		static registerDomEvents(
			el: HTMLElement,
			handlerInstance: unknown,
			cb: (el: HTMLElement) => unknown
		): void;
	}

	export interface View {
		contentEl: HTMLElement;
		editMode: any;
		sourceMode: any;
		canvas?: any;
		editor: Editor;
		forwardButtonEl: HTMLElement;
		backButtonEl: HTMLElement;
		titleEl: HTMLElement;
		moreOptionsButtonEl: HTMLElement;
		file?: any;
		titleContainerEl: HTMLElement;
	}

	export interface Editor {
		getClickableTokenAt: (editorPos: EditorPosition) => tokenType;
	}

	export interface MenuItem {
		setSubmenu: () => Menu;
	}
	export interface MarkdownFileInfo {
		leaf: WorkspaceLeaf;
	}

	export interface MarkdownView {
		triggerClickableToken: (token: tokenType, t: boolean | string) => void;
	}

	export interface MarkdownSourceView {
		triggerClickableToken: (token: tokenType, t: boolean | string) => void;
	}

	export interface MarkdownRenderer {
		constructor: (t: any, e: any, c: any) => any;
	}
}

export type Side = "top" | "right" | "bottom" | "left";

export interface CanvasData {
	nodes: (CanvasFileData | CanvasTextData | CanvasLinkData)[];
	edges: CanvasEdgeData[];
}

export interface CanvasNodeData {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
}

export interface CanvasEdgeData {
	id: string;
	fromNode: string;
	fromSide: Side;
	toNode: string;
	toSide: Side;
	color: string;
	label: string;
}

export interface CanvasFileData extends CanvasNodeData {
	type: "file";
	file: string;
}

export interface CanvasTextData extends CanvasNodeData {
	type: "text";
	text: string;
}

export interface CanvasLinkData extends CanvasNodeData {
	type: "link";
	url: string;
}

export interface ISuggestOwner<T> {
	renderSuggestion(value: T, el: HTMLElement, index?: number): void;
}

interface tokenType {
	end: {
		line: number;
		ch: number;
	};
	start: {
		line: number;
		ch: number;
	};
	text: string;
	type: string;
}
