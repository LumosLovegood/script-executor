export const parseZhipuChunk = (chunk: string) => {
	chunk = chunk.replace(/data: /g, "");
	chunk = chunk.replace(/\[DONE\]/g, "");
	const resList = chunk.split("\n").filter((item) => item != "");
	if (resList.length == 1) {
		return JSON.parse(chunk).choices[0].delta.content;
	}
	return resList.map(
		(item) => JSON.parse(item).choices[0].delta.content
	).join("");
};
