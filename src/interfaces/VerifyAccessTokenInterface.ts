import {VerifyDecodePayloadInterface} from "./VerifyDecodePayload.interface";
import {TokenStatusEnum} from "../enums/tokenStatus.enum";

export interface VerifyAccessTokenInterface {
    status: TokenStatusEnum.valid | TokenStatusEnum.expired | TokenStatusEnum.invalid;
    payload?: VerifyDecodePayloadInterface;
    message?: string;
}