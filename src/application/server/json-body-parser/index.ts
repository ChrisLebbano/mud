import { type IncomingMessage } from "node:http";

export class JsonBodyParser {

    public parse<T>(request: IncomingMessage): Promise<T> {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];

            request.on("data", (chunk) => {
                if (Buffer.isBuffer(chunk)) {
                    chunks.push(chunk);
                    return;
                }

                chunks.push(Buffer.from(chunk));
            });

            request.on("end", () => {
                const rawBody = Buffer.concat(chunks).toString("utf8");
                try {
                    resolve(JSON.parse(rawBody) as T);
                } catch (error) {
                    reject(error);
                }
            });

            request.on("error", (error) => {
                reject(error);
            });
        });
    }

}

