import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fetchLiquipedia } from "../src/liquipedia";

const json = (body: unknown, status = 200): Response =>
	new Response(JSON.stringify(body), { status });

describe("fetchLiquipedia", () => {
	it("renvoie le JSON d'une réponse OK", async () => {
		const payload = { parse: { text: { "*": "<p>hi</p>" } } };
		const fetchImpl = async () => json(payload);

		const result = await fetchLiquipedia("https://example.com", { fetchImpl });

		assert.deepEqual(result, payload);
	});

	it("jette une erreur sur un statut non-OK, sans retry", async () => {
		let calls = 0;
		const fetchImpl = async (): Promise<Response> => {
			calls++;
			return new Response(null, { status: 503 });
		};

		await assert.rejects(
			fetchLiquipedia("https://example.com", { fetchImpl }),
			/503/
		);
		assert.equal(calls, 1);
	});

	it("jette l'erreur réseau telle quelle, sans retry", async () => {
		let calls = 0;
		const fetchImpl = async (): Promise<Response> => {
			calls++;
			throw new Error("ECONNRESET");
		};

		await assert.rejects(
			fetchLiquipedia("https://example.com", { fetchImpl }),
			/ECONNRESET/
		);
		assert.equal(calls, 1);
	});

	it("appelle beforeAttempt avant la requête", async () => {
		const fetchImpl = async () => json({});
		let hooks = 0;

		await fetchLiquipedia("https://example.com", {
			fetchImpl,
			beforeAttempt: async () => {
				hooks++;
			},
		});

		assert.equal(hooks, 1);
	});
});
