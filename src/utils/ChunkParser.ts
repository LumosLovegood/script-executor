export default class ChunkParser {
	constructor(readonly llmName: string) {}
	parse(chunk: string) {
		if (this.llmName == "zhipu") {
			return this.parseZhipu(chunk);
		}
		return this.parseZhipu(chunk);
	}
	parseZhipu(chunk: string) {
		chunk = chunk.replace(/data: /g, "");
		chunk = chunk.replace(/\[DONE\]/g, "");
		const resList = chunk.split("\n").filter((item) => item != "");
		if (resList.length == 1) {
			return JSON.parse(chunk).choices[0].delta.content;
		}
		return resList
			.map((item) => JSON.parse(item).choices[0].delta.content)
			.join("");
	}
}
