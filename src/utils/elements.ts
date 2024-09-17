import { Menu } from "obsidian";

export const addClickEvent = (el: HTMLElement, callback: () => void) => {
	el.onclick = callback;
};

export const addContextMenu = (
	el: HTMLElement,
	callbacks?: { [key: string]: () => void }
) => {
	const menu = new Menu();
	if (callbacks) {
		for (const key in callbacks) {
			addMenuItem(menu, key, callbacks[key]);
		}
	}
	el.oncontextmenu = (e) => {
		menu.showAtMouseEvent(e);
	};
	return menu;
};

export const addMenuItem = (
	menu: Menu,
	title: string,
	callback: () => void
) => {
	menu.addItem((item) => {
		item.setTitle(title).onClick(callback);
	});
};
