import { parseZhipuChunk } from "src/utils/parses";
import {
	BaseLLM,
	LLMConifg,
	LLMChatMessage,
	ZhipuResponse,
	LLMChatParams,
} from "../types/type";

export default class ZhipuLLM implements BaseLLM {
	private readonly apiKey: string;
	private readonly endpoint: string;
	private readonly model: string | undefined;
	private history: LLMChatMessage[];
	private lastInfo: LLMChatParams;

	constructor({ apiKey, endpoint, model }: LLMConifg) {
		this.apiKey = apiKey;
		this.endpoint = endpoint;
		this.model = model;
		this.history = [];
	}

	async chat(chatParams: LLMChatParams): Promise<string> {
		this._snapshot(chatParams);
		const { question, useHistory, type, callback, delay } = chatParams;
		const userMessage: LLMChatMessage = { role: "user", content: question };
		const messages = useHistory
			? [...this.history, userMessage]
			: [userMessage];
		console.log("messages: ", messages);
		let llmResult: string;
		if (type === "streamChat") {
			const generator = this._llm_stream(messages);
			llmResult = await this._generate(generator, callback, delay);
		} else {
			llmResult = await this._llm(messages);
		}
		const llmMessage: LLMChatMessage = {
			role: "assistant",
			content: llmResult,
		};
		useHistory && this._addHistory([userMessage, llmMessage]);
		return llmResult;
	}

	async retry() {
		if (!this.lastInfo) {
			throw new Error("No history to retry");
		}
		this._rollbackHistory();
		const llmResult = await this.chat(this.lastInfo);
		return llmResult;
	}

	clearHistory() {
		this.history = [];
	}

	private _addHistory(messages: LLMChatMessage[]) {
		this.history = [...this.history, ...messages];
	}

	private async _llm(messages: LLMChatMessage[]): Promise<string> {
		const llmRequestParams = this._getRequestParams(messages);
		const res = await fetch(this.endpoint, llmRequestParams);
		const resData: ZhipuResponse = await res.json();
		const llmResult = resData.choices[0].message.content;
		return llmResult;
	}

	private async *_llm_stream(
		messages: LLMChatMessage[]
	): AsyncGenerator<string, void, unknown> {
		const stream = await fetch(
			this.endpoint,
			this._getRequestParams(messages, true)
		);
		if (!stream || !stream.body) {
			throw new Error(`HTTP error!`);
		}
		const reader = stream.body.getReader();
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

	private async _generate(
		generator: AsyncGenerator<string, void, unknown>,
		callback?: (word: string) => void,
		delay?: number
	) {
		let llmResult = "";
		for await (const char of generator) {
			callback && callback(char);
			llmResult += char;
			delay &&
				(await new Promise((resolve) => setTimeout(resolve, delay)));
		}
		return llmResult;
	}

	private _snapshot(chatRequest: LLMChatParams) {
		this.lastInfo = chatRequest;
	}

	private _rollbackHistory() {
		this.history.pop();
		this.history.pop();
	}

	private _getRequestParams(
		messages: LLMChatMessage[],
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
