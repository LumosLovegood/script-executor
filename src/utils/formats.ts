import { normalizePath } from "obsidian";

const BASE64_CODE_REX = /^data:image\/\w+;base64,/;
const FILENAME_REX = /[\\/:*?"<>|]/g;

const rexformat = (str: string, regex: RegExp, mode?: "replace") => {
	if (!str) return "";
	return str.replace(regex, "");
};

export const formatBase64 = (base64: string) => {
	return rexformat(base64, BASE64_CODE_REX, "replace");
};

export const formatFileName = (filename: string, ext: string) => {
	return rexformat(filename, FILENAME_REX, "replace") + "." + ext;
};

export const formatFilePath = (folder: string, name: string, ext?: string) => {
	const fileName = formatFileName(name, "md");
	let filePath = normalizePath(`${folder}/${fileName}`);
	if (ext) filePath += `.${ext}`;
	return filePath;
};

export const formatMdInLink = (
	path: string,
	type: "link" | "embed",
	mode?: "ob" | "std",
	text = ""
) => {
	let markdown = `[${text}](${path})`;
	if (mode === "ob") markdown = `[[${path}|{${text}}]]`;
	markdown = type === "link" ? markdown : "!" + markdown;
	return markdown;
};

export const formatMdExLink = (
	url: string,
	type: "link" | "embed",
	text = ""
) => {
	let markdown = `[${text}](${url})`;
	markdown = type === "link" ? markdown : "!" + markdown;
	return markdown;
};

export const formatMdInImage = (url: string) => {
	return formatMdInLink(url, "embed");
};

export const durationToSec = (time: string) => {
	const timeArr = time.split(":").reverse();
	let seconds = 0;
	timeArr.forEach((t, i) => (seconds += Number(t) * 60 ** i));
	return seconds;
};

export const secToDuration = (seconds: any) => {
	seconds = Number(seconds).toFixed();
	const hour = Math.floor(seconds / 3600);
	const minute = Math.floor((seconds % 3600) / 60);
	const second = seconds % 60;
	return `${hour > 0 ? hour + ":" : ""}${
		minute > 9 ? minute : "0" + minute
	}:${second > 9 ? second : "0" + second}`;
};

export const formatCodeBlock = (lang: string, content: string) => {
	return `\`\`\`${lang}\n${content}\n\`\`\`\n`;
};
