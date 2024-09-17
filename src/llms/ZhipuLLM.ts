import { LLM, LLMChatMessage, LLMConifg, ZhipuResponse } from "../types/type";

export default class ZhipuLLM implements LLM {
	constructor(private readonly config: LLMConifg) {}

	async predict(messages: LLMChatMessage[]): Promise<string> {
		const params = this._getRequestParams(messages);
		const response = await fetch(this.config.endpoint, params);
		const resData: ZhipuResponse = await response.json();
		const llmResult = resData.choices[0].message.content;
		return llmResult;
	}

	async stream(
		messages: LLMChatMessage[]
	): Promise<ReadableStreamDefaultReader<Uint8Array>> {
		const params = this._getRequestParams(messages, true);
		const stream = await fetch(this.config.endpoint, params);
		if (!stream || !stream.body) {
			throw new Error(`HTTP error!`);
		}
		return stream.body.getReader();
	}

	protected _getRequestParams(
		messages: LLMChatMessage[],
		stream?: boolean
	): RequestInit {
		const headers = {
			Authorization: `Bearer ${this.config.apiKey}`,
			"Content-Type": "application/json",
		};
		const data = {
			model: this.config.model,
			messages,
			stream: stream ?? false,
		};
		return {
			method: "POST",
			headers: headers,
			body: JSON.stringify(data),
		};
	}
}
