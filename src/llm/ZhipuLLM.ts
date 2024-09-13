import { parseZhipuChunk } from "src/utils/parses";
import { BaseLLM, LLMConifg, LLMMessage, ZhipuResponse } from "../types/type";

export default class ZhipuLLM implements BaseLLM {
	private readonly apiKey: string;
	private readonly endpoint: string;
	private readonly model: string | undefined;
	private history: LLMMessage[];

	constructor({ apiKey, endpoint, model }: LLMConifg) {
		this.apiKey = apiKey;
		this.endpoint = endpoint;
		this.model = model;
		this.history = [];
	}

	async chat(prompt: string, useHistory?: boolean): Promise<string> {
		let messages: LLMMessage[];
		if (useHistory) {
			this.history.push({ role: "user", content: prompt });
			messages = this.history;
		} else {
			messages = [{ role: "user", content: prompt }];
		}
		const llmResult = await this._llm(messages);
		this.history.push({ role: "assistant", content: llmResult });
		return llmResult;
	}

	async streamChat(
		prompt: string,
		callback: (word: string) => void,
		useHistory?: boolean,
		delay = 0
	): Promise<void> {
		let messages: LLMMessage[];
		if (useHistory) {
			this.history.push({ role: "user", content: prompt });
			messages = this.history;
		} else {
			messages = [{ role: "user", content: prompt }];
		}
		const generator = this._llm_stream(messages);
		let llmResult = "";
		for await (const char of generator) {
			callback(char);
			llmResult += char;
			delay &&
				(await new Promise((resolve) => setTimeout(resolve, delay)));
		}
		this.history.push({ role: "assistant", content: llmResult });
	}

	clearHistory() {
		this.history = [];
	}

	private async _llm(messages: LLMMessage[]): Promise<string> {
		const llmRequestParams = this.getRequestParams(messages);
		const res = await fetch(this.endpoint, llmRequestParams);
		const resData: ZhipuResponse = await res.json();
		const llmResult = resData.choices[0].message.content;
		return llmResult;
	}

	private async *_llm_stream(
		messages: LLMMessage[]
	): AsyncGenerator<string, void, unknown> {
		const response = await fetch(
			this.endpoint,
			this.getRequestParams(messages, true)
		);
		if (!response || !response.body) {
			throw new Error(`HTTP error!`);
		}
		const reader = response.body.getReader();
		const decoder = new TextDecoder("utf-8");
		let done = false;
		while (!done) {
			const { value, done: readerDone } = await reader.read();
			done = readerDone;
			if (value) {
				const chunk = decoder.decode(value, { stream: true });
				const word = parseZhipuChunk(chunk);
				yield word;
			}
		}
	}

	private getRequestParams(
		messages: LLMMessage[],
		stream?: boolean
	): RequestInit {
		const headers = {
			Authorization: `Bearer ${this.apiKey}`,
			"Content-Type": "application/json",
		};
		const data = {
			model: this.model,
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
