import ZhipuLLM from "./llms/ZhipuLLM";
import {
	LLM,
	LLMChatCallback,
	LLMChatMessage,
	LLMChatParams,
} from "./types/type";
import { formatAssistMessage, formatUserMessage } from "./utils/formats";
import { LLMInfo } from "./types/type";

const MAX_HISTORY_LENGTH = 5;
export default class ScriptExectorAgent {
	private llm: LLM;
	private history: LLMChatMessage[];
	private question: string;
	private reader: ReadableStreamDefaultReader<Uint8Array>;
	private chatParams: LLMChatParams | undefined;

	constructor(LLMInfo: LLMInfo) {
		const { selected, map } = LLMInfo;
		if (selected === "zhipu") {
			this.llm = new ZhipuLLM(map.zhipu);
		}
		this.history = [];
	}

	async execute(
		question: string,
		chatParams?: LLMChatParams
	): Promise<string> {
		this._recordInfo(question, chatParams);
		const userMessage = formatUserMessage(question);
		const messages = chatParams?.useHistory
			? [...this.history, userMessage]
			: [userMessage];
		let llmResult: string;
		if (chatParams?.stream) {
			this.reader = await this.llm.stream(messages);
			llmResult = await this._generate(
				chatParams?.callback,
				chatParams?.delay
			);
		} else {
			llmResult = await this.llm.predict(messages);
		}
		const assitMessage = formatAssistMessage(llmResult);
		chatParams?.useHistory && this._addHistory([userMessage, assitMessage]);
		return llmResult;
	}

	rollback() {
		this.history.pop();
		this.history.pop();
		return { question: this.question, chatParams: this.chatParams };
	}

	async retry() {
		if (!this.chatParams) {
			throw new Error("No history to retry");
		}
		this.rollback();
		const llmResult = await this.execute(this.question, this.chatParams);
		return llmResult;
	}

	clear() {
		this.history = [];
	}

	cancel() {
		this.reader.cancel();
	}

	protected _addHistory(messages: LLMChatMessage[]) {
		this.history = [...this.history, ...messages];
		if (this.history.length > MAX_HISTORY_LENGTH) {
			this.history.shift();
		}
	}

	protected _recordInfo(question: string, chatRequest?: LLMChatParams) {
		this.question = question;
		this.chatParams = chatRequest;
	}

	private async _generate(callback?: LLMChatCallback, delay?: number) {
		const decoder = new TextDecoder("utf-8");
		let done = false;
		let llmResult = "";
		while (!done) {
			const { value, done: readerDone } = await this.reader.read();
			done = readerDone;
			if (!value) {
				continue;
			}
			const chunk = decoder.decode(value, { stream: true });
			const char = this.llm.parseChunk(chunk);
			llmResult += char;
			callback && callback(char);
			delay &&
				(await new Promise((resolve) => setTimeout(resolve, delay)));
		}
		return llmResult;
	}
}
