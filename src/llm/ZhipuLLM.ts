import { parseZhipuChunk } from "src/utils/parses";
import { BaseLLM, LLMConifg, ZhipuResponse } from "../types/type";
import { App } from "obsidian";

export default class ZhipuLLM implements BaseLLM {
	private readonly apiKey: string;
	private readonly endpoint: string;
	private readonly model: string | undefined;
	private readonly delay: number | undefined;
	private readonly history: string[] = [];

	constructor(
		{ apiKey, endpoint, model, delay }: LLMConifg,
		private readonly app: App
	) {
		this.apiKey = apiKey;
		this.endpoint = endpoint;
		this.model = model;
		this.delay = delay;
	}

	async chat(prompt: string): Promise<string> {
		return this._llm(prompt);
	}

	async chatStream(
		prompt: string,
		callback: (word: string) => void
	): Promise<void> {
		const generator = this._llm_stream(prompt);
		for await (const word of generator) {
			callback(word);
			this.delay &&
				(await new Promise((resolve) =>
					setTimeout(resolve, this.delay)
				));
		}
	}

	private async _llm(prompt: string): Promise<string> {
		const res = await fetch(
			this.endpoint,
			this.getRequestParams(prompt, false)
		);
		const resData: ZhipuResponse = await res.json();
		return resData.choices[0].message.content;
	}

	private async *_llm_stream(
		prompt: string
	): AsyncGenerator<string, void, unknown> {
		const response = await fetch(
			this.endpoint,
			this.getRequestParams(prompt, true)
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

	private getRequestParams(prompt: string, stream?: boolean): RequestInit {
		const headers = {
			Authorization: `Bearer ${this.apiKey}`,
			"Content-Type": "application/json",
		};
		const data = {
			model: this.model,
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
			stream: stream ?? false,
		};
		return {
			method: "POST",
			headers: headers,
			body: JSON.stringify(data),
		};
	}
}
