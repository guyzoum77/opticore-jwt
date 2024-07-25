import {AlgorithmType} from "../types/algorithm.type";
import {BaseUrlUtils} from "../utils/baseUrl.utils";
import {BinaryToTextEncoding, createHmac} from "node:crypto";
import {HashAlgorithmType} from "../types/hashAlgorithm.type";
import {SignOptionsInterface as SignOptions} from "../interfaces/signOptions.interface";
import {JwtHeader} from "../interfaces/jwtHeader.interface";
import {VerifyOptionsInterface as VerifyOptions} from "../interfaces/verifyOptions.interface";
import {ErrorMessage as msg} from "../exceptions/messages/error.message";
import StackTraceHandler from "../exceptions/handler/stackTrace.handler";
import {HttpStatusCodesConstant as status} from "../utils/constants/httpStatusCode.constant";
import {VerifyDecodePayloadInterface as VerifyDecodePayload} from "../interfaces/VerifyDecodePayload.interface";
import {VerifyResultInterface as VerifyResult} from "../interfaces/VerifyResultInterface";
import {TokenStatusEnum as tokenStatus} from "../enums/tokenStatus.enum";

export class JWToken {
    
    static codeStatus: status = status.NOT_ACCEPTABLE;

    /**
     *
     * @param time
     * @protected
     */
    protected static toSeconds(time: string | number): number {
        if (typeof time === 'string') {
            const match: RegExpMatchArray | null = time.match(/^(\d+)([smhd])$/);
            if (!match) {
                throw new StackTraceHandler(msg.timeFormatErrTitle, msg.timeFormatErrName, msg.timeFormatErrMsg, this.codeStatus, true);
            }
            const value: number = parseInt(match[1], 10);
            const unit: string = match[2];
            switch (unit) {
                case 's': return value;
                case 'm': return value * 60;
                case 'h': return value * 3600;
                case 'd': return value * 86400;
                default: throw new StackTraceHandler(msg.timeUnitErrTitle, msg.timeUnitErrName, msg.timeUnitErrMsg, this.codeStatus, true);
            }
        }
        return time;
    }

    /**
     *
     * @param tokenAudience
     * @param audience
     * @protected
     */
    protected static validateAudience(tokenAudience: string | string[], audience: string | string[]): boolean {
        if (Array.isArray(audience)) {
            return Array.isArray(tokenAudience)
                ? audience.some((aud: string) => tokenAudience.includes(aud))
                : audience.includes(tokenAudience);
        } else {
            return Array.isArray(tokenAudience)
                ? tokenAudience.includes(audience)
                : tokenAudience === audience;
        }
    }

    /**
     *
     * @param payload
     * @param privateSecretKey
     * @param headerAlgorithm
     * @param signAlgorithm
     * @param options
     */
    static sign(payload: object, privateSecretKey: string, headerAlgorithm: AlgorithmType, signAlgorithm: HashAlgorithmType, options: SignOptions): string {
        const currentTimestamp: number = Math.floor(Date.now() / 1000);
        const fullPayload = {
            ...payload,
            ...(options.expiresIn && { exp: currentTimestamp + this.toSeconds(options.expiresIn) }),
            ...(options.notBefore && { nbf: currentTimestamp + this.toSeconds(options.notBefore) }),
            ...(options.audience && { aud: options.audience }),
            ...(options.subject && { sub: options.subject }),
            ...(options.issuer && { iss: options.issuer }),
            ...(options.jwtId && { jti: options.jwtId }),
            ...(options.noTimestamp ? {} : { iat: currentTimestamp })
        };

        if (options.mutatePayload) {
            Object.assign(payload, fullPayload);
        }

        const fullHeader: JwtHeader = { alg: headerAlgorithm, typ: 'JWT', ...options.header };

        const encodedHeader: string  = BaseUrlUtils.base64UrlEncode(JSON.stringify(fullHeader));
        const encodedPayload: string = BaseUrlUtils.base64UrlEncode(JSON.stringify(fullPayload));

        const signature: string = createHmac(signAlgorithm, privateSecretKey)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest(<BinaryToTextEncoding>options.encoding || "base64")
            .replace(/=+$/, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }


    /**
     *
     * @param token
     * @param publicSecretKey
     * @param signAlgorithm
     * @param options
     *
     * Return a valid as status and payload after all verification conditions are met.
     */
    static verify(token: string, publicSecretKey: string, signAlgorithm: HashAlgorithmType, options: VerifyOptions): VerifyResult {
        const [headerB64, payloadB64, signature] = token.split(".");

        const decodedHeader: JwtHeader = JSON.parse(BaseUrlUtils.base64UrlDecode(headerB64));
        if (options.algorithm && decodedHeader.alg !== options.algorithm) {
            return { status: tokenStatus.invalid, message: msg.algErrMsg };
        }

        switch (true) {
            case options.algorithm && typeof options.algorithm !== 'string':
                return { status: tokenStatus.invalid, message: msg.algErrMsg };
            case options.audience && !Array.isArray(options.audience) && typeof options.audience !== 'string':
                return { status: tokenStatus.invalid, message: msg.audTypeErrMsg };
            case options.subject && typeof options.subject !== 'string':
                return { status: tokenStatus.invalid, message: msg.subjErrMsg };
            case options.issuer && typeof options.issuer !== 'string':
                return { status: tokenStatus.invalid, message: msg.issTypeErrMsg };
            case options.jwtId && typeof options.jwtId !== 'string':
                return { status: tokenStatus.invalid, message: msg.jwtIdErrMsg };
            case options.maxAge && typeof options.maxAge !== 'string' && typeof options.maxAge !== 'number':
                return { status: tokenStatus.invalid, message: msg.maxAgeTypeErrMsg };
            case options.clockTolerance && typeof options.clockTolerance !== 'number':
                return { status: tokenStatus.invalid, message: msg.clockTolErrMsg };
            case options.clockTimestamp && typeof options.clockTimestamp !== 'number':
                return { status: tokenStatus.invalid, message: msg.clockTimeErrMsg };
            case options.allowInsecureKeySizes && typeof options.allowInsecureKeySizes !== 'boolean':
                return { status: tokenStatus.invalid, message: msg.allowInsecKeyErrMsg };
            case options.allowInvalidAsymmetricKeyTypes && typeof options.allowInvalidAsymmetricKeyTypes !== 'boolean':
                return { status: tokenStatus.invalid, message: msg.allowInvAsyErrMsg };
        }

        const signatureCheck: string = createHmac(signAlgorithm, publicSecretKey)
            .update(`${headerB64}.${payloadB64}`)
            .digest("base64")
            .replace(/=+$/, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");

        if (signature !== signatureCheck) {
            return { status: tokenStatus.invalid, message: msg.signErrMsg };
        }

        const payload = JSON.parse(BaseUrlUtils.base64UrlDecode(payloadB64));

        options.clockTimestamp = Math.floor(Date.now() / 1000);
        const currentTimestamp: number = options.clockTimestamp;

        if (payload.exp && currentTimestamp >= payload.exp + options.clockTolerance || 0) {
            return { status: tokenStatus.expired, payload, message: msg.tokenExpiresErrMsg };
        }

        if (payload.nbf && currentTimestamp < payload.nbf - (options.clockTolerance!)) {
            return { status: tokenStatus.invalid, message: msg.tokenInactivatedErrMsg };
        }

        if (options.audience && !this.validateAudience(payload.aud, options.audience)) {
            return { status: tokenStatus.invalid, message: msg.audErrMsg };
        }

        if (options.subject && payload.sub !== options.subject) {
            return { status: tokenStatus.invalid, message: msg.subjErrMsg };
        }

        if (options.issuer && payload.iss !== options.issuer) {
            return { status: tokenStatus.invalid, message: msg.issInvErrMsg };
        }

        if (options.jwtId && payload.jti !== options.jwtId) {
            return { status: tokenStatus.invalid, message: msg.jwtIdInvErrMsg };
        }

        if (options.maxAge && (currentTimestamp - payload.iat) > this.toSeconds(options.maxAge)) {
            return { status: tokenStatus.invalid, message: msg.tokenMaxErrMsg };
        }

        return { status: tokenStatus.valid, payload };
    }


    /**
     *
     * @param token
     * @param privateSecretKey
     * @param publicSecretKey
     * @param headerAlgorithm
     * @param signAlgorithm
     * @param signOptions
     * @param verifyOptions
     * @param expiresTime
     *
     * Return a new token when the generated token is expires.
     */
    static refreshToken(token: string, privateSecretKey: string, publicSecretKey: string, headerAlgorithm: AlgorithmType,
                        signAlgorithm: HashAlgorithmType, signOptions: SignOptions, verifyOptions: VerifyOptions,
                        expiresTime?: number | undefined): string | null {
        const verificationResult: VerifyResult = this.verify(token, publicSecretKey, signAlgorithm, verifyOptions);

        if (verificationResult.status === tokenStatus.expired) {
            const payload: VerifyDecodePayload | undefined = verificationResult.payload;
            if (payload) {
                delete payload.exp;
                payload.exp = typeof expiresTime !== undefined
                    ? expiresTime
                    : Math.floor(Date.now() / 1000) + (60 * 60); // 1 hour
                return this.sign(payload, privateSecretKey, headerAlgorithm, signAlgorithm, signOptions);
            }
        }

        return null;
    }
}