import { IMe } from "definitions/IMe";

export type MeEndpoints = {
	'me': {
		GET: () => IMe;
	};
};