import {AlgorithmType} from "../types/algorithm.type";

export interface VerifyOptionsInterface {
    algorithm?: AlgorithmType;
    audience?: string | string[];
    subject?: string;
    issuer?: string;
    jwtId?: string;
    maxAge?: string | number;
    clockTolerance?: number;
    clockTimestamp?: number;
    allowInsecureKeySizes?: boolean;
    allowInvalidAsymmetricKeyTypes?: boolean;
}