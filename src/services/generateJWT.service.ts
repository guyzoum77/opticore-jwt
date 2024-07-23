import {AlgorithmType} from "../types/algorithm.type";
import {BaseUrlUtils} from "../utils/baseUrl.utils";
import {createHmac} from "node:crypto";
import {HashAlgorithmType} from "../types/hashAlgorithm.type";
import {SignOptionsInterface} from "../interfaces/signOptions.interface";

export class JWT {
    static sign(payload: object, privateSecretKey: string, headerAlgorithm: AlgorithmType, signAlgorithm: HashAlgorithmType, options: SignOptionsInterface) {
        const header = {
            alg: headerAlgorithm,
            typ: "JWT"
        };

        const encodedHeader: string = BaseUrlUtils.base64UrlEncode(JSON.stringify(header));
        const encodedPayload: string = BaseUrlUtils.base64UrlEncode(JSON.stringify(payload));

        const signature: string = createHmac(signAlgorithm, privateSecretKey)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest("base64")
            .replace(/=+$/, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    static verify(token: string, publicSecretKey: string, signAlgorithm: HashAlgorithmType): object | null {
        const [headerB64, payloadB64, signature] = token.split(".");

        const signatureCheck: string = createHmac(signAlgorithm, publicSecretKey)
            .update(`${headerB64}.${payloadB64}`)
            .digest("base64")
            .replace(/=+$/, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");

        if (signature !== signatureCheck) {
            return null;
        }

        return JSON.parse(BaseUrlUtils.base64UrlDecode(payloadB64));
    }
}