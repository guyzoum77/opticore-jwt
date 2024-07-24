import {AlgorithmType} from "../types/algorithm.type";
import {BaseUrlUtils} from "../utils/baseUrl.utils";
import {BinaryToTextEncoding, createHmac} from "node:crypto";
import {HashAlgorithmType} from "../types/hashAlgorithm.type";
import {SignOptionsInterface} from "../interfaces/signOptions.interface";
import {JwtHeader} from "../interfaces/jwtHeader.interface";
import {VerifyOptionsInterface} from "../interfaces/verifyOptions.interface";
import {ErrorMessage as msg} from "../exceptions/messages/error.message";
import StackTraceHandler from "../exceptions/handler/stackTrace.handler";
import {HttpStatusCodesConstant as status} from "../utils/constants/httpStatusCode.constant";

export class JWToken {
    
    static codeStatus: status = status.NOT_ACCEPTABLE;

    /**
     *
     * @param payload
     * @param privateSecretKey
     * @param headerAlgorithm
     * @param signAlgorithm
     * @param options
     */
    static sign(payload: object, privateSecretKey: string, headerAlgorithm: AlgorithmType, 
                signAlgorithm: HashAlgorithmType, options: SignOptionsInterface): string {
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
     */
    static verify(token: string, publicSecretKey: string, signAlgorithm: HashAlgorithmType, options: VerifyOptionsInterface): object | null {
        const [headerB64, payloadB64, signature] = token.split(".");

        const decodedHeader: JwtHeader = JSON.parse(BaseUrlUtils.base64UrlDecode(headerB64));
        if (options.algorithm && decodedHeader.alg !== options.algorithm) {
            return new StackTraceHandler(msg.algTypeErrTitle, msg.algTypeErrName, msg.algTypeErrMsg, this.codeStatus, true);
        }

        switch (true) {
            case options.algorithm && typeof options.algorithm !== 'string':
                return new StackTraceHandler(msg.algErrTitle, msg.algErrName, msg.algErrMsg, this.codeStatus, true);
            case options.audience && !Array.isArray(options.audience) && typeof options.audience !== 'string':
                return new StackTraceHandler(msg.audTypeErrTitle, msg.audTypeErrName, msg.audTypeErrMsg, this.codeStatus, true);
            case options.subject && typeof options.subject !== 'string':
                return new StackTraceHandler(msg.subjErrTitle, msg.subjErrName, msg.subjErrMsg, this.codeStatus, true);
            case options.issuer && typeof options.issuer !== 'string':
                return new StackTraceHandler(msg.issTypeErrTitle, msg.issTypeErrName, msg.issTypeErrMsg, this.codeStatus, true);
            case options.jwtId && typeof options.jwtId !== 'string':
                return new StackTraceHandler(msg.jwtIdErrTitle, msg.jwtIdErrName, msg.jwtIdErrMsg, this.codeStatus, true);
            case options.maxAge && typeof options.maxAge !== 'string' && typeof options.maxAge !== 'number':
                return new StackTraceHandler(msg.maxAgeTypeErrTitle, msg.maxAgeTypeErrName, msg.maxAgeTypeErrMsg, this.codeStatus, true);
            case options.clockTolerance && typeof options.clockTolerance !== 'number':
                return new StackTraceHandler(msg.clockTolErrTitle, msg.clockTolErrName, msg.clockTolErrMsg, this.codeStatus, true);
            case options.clockTimestamp && typeof options.clockTimestamp !== 'number':
                return new StackTraceHandler(msg.clockTimeErrTitle, msg.clockTimeErrName, msg.clockTimeErrMsg, this.codeStatus, true);
            case options.allowInsecureKeySizes && typeof options.allowInsecureKeySizes !== 'boolean':
                return new StackTraceHandler(msg.allowInsecKeyErrTitle, msg.allowInsecKeyErrName, msg.allowInsecKeyErrMsg, this.codeStatus, true);
            case options.allowInvalidAsymmetricKeyTypes && typeof options.allowInvalidAsymmetricKeyTypes !== 'boolean':
                return new StackTraceHandler(msg.allowInvAsyErrTitle, msg.allowInvAsyErrName, msg.allowInvAsyErrMsg, this.codeStatus, true);
        }

        const signatureCheck: string = createHmac(signAlgorithm, publicSecretKey)
            .update(`${headerB64}.${payloadB64}`)
            .digest("base64")
            .replace(/=+$/, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");

        if (signature !== signatureCheck) {
            return new StackTraceHandler(msg.signErrTitle, msg.signErrName, msg.signErrMsg, this.codeStatus, true);
        }

        const payload = JSON.parse(BaseUrlUtils.base64UrlDecode(payloadB64));

        options.clockTimestamp = Math.floor(Date.now() / 1000);
        const currentTimestamp: number = options.clockTimestamp;

        if (payload.exp && currentTimestamp >= payload.exp + options.clockTolerance) {
            return new StackTraceHandler(msg.tokenExpiresErrTitle, msg.tokenExpiresName, msg.tokenExpiresErrMsg, this.codeStatus, true);
        }

        if (payload.nbf && currentTimestamp < payload.nbf - (options.clockTolerance!)) {
            return new StackTraceHandler(msg.tokenInactivatedErrTitle, msg.tokenInactivatedErrName, msg.tokenInactivatedErrMsg, this.codeStatus, true);
        }

        if (options.audience && !this.validateAudience(payload.aud, options.audience)) {
            return new StackTraceHandler(msg.audErrTitle, msg.audErrName, msg.audErrMsg, this.codeStatus, true);
        }

        if (options.subject && payload.sub !== options.subject) {
            return new StackTraceHandler(msg.subjErrTitle, msg.subjErrName, msg.subjErrMsg, this.codeStatus, true);
        }

        if (options.issuer && payload.iss !== options.issuer) {
            return new StackTraceHandler(msg.issInvErrTitle, msg.issInvErrName, msg.issInvErrMsg, this.codeStatus, true);
        }

        if (options.jwtId && payload.jti !== options.jwtId) {
            return new StackTraceHandler(msg.jwtIdInvErrTitle, msg.jwtIdInvErrName, msg.jwtIdInvErrMsg, this.codeStatus, true);
        }

        if (options.maxAge && (currentTimestamp - payload.iat) > this.toSeconds(options.maxAge)) {
            return new StackTraceHandler(msg.tokenMaxErrTitle, msg.tokenMaxErrName, msg.tokenMaxErrMsg, this.codeStatus, true);
        }

        return payload;
    }

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
}