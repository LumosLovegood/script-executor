import { MarkdownPostProcessorContext, Menu, parseYaml } from "obsidian";
import ScriptExecutorApi from "src/ScriptExecutorApi";
import { addContextMenu, addMenuItem } from "../utils/elements";

export default class BlockHandler {
	private menu: Menu;
	constructor(
		readonly seApi: ScriptExecutorApi,
		readonly src: string,
		readonly el: HTMLElement,
		readonly ctx: MarkdownPostProcessorContext
	) {}

	addMenu(el?: HTMLElement, callbacks?: { [key: string]: () => void }) {
		if (!el) {
			el = this.el;
		}
		this.menu = addContextMenu(el, callbacks);
		return this.menu;
	}

	addMenuItem(menu: Menu, callback: () => void) {
		if (menu) {
			menu = this.menu;
		}
		if (!menu) {
			new Error("Menu is not defined");
		}
		addMenuItem(menu, "Run", callback);
	}

	textToList(text?: string) {
		if (!text) {
			text = this.src;
		}
		return text
			.split("\n")
			.filter((line) => line.trim().length > 0)
			.map((line) => line.trim());
	}

	yamlToObject(text?: string) {
		if (!text) {
			text = this.src;
		}
		try {
			return parseYaml(text);
		} catch (e) {
			new Error("Failed to parse yaml");
		}
	}

	createEl(
		tag: keyof HTMLElementTagNameMap,
		text?: string,
		el?: HTMLElement
	) {
		if (!el) {
			el = this.el;
		}
		return el.createEl(tag, { text: text });
	}

	createSpan(text?: string, el?: HTMLElement) {
		return this.createEl("span", text, el);
	}
}
