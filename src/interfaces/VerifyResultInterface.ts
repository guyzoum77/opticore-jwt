import {VerifyDecodePayloadInterface} from "./VerifyDecodePayload.interface";
import {TokenStatusEnum} from "../enums/tokenStatus.enum";

export interface VerifyResultInterface {
    status: TokenStatusEnum.valid | TokenStatusEnum.expired | TokenStatusEnum.invalid;
    payload?: VerifyDecodePayloadInterface;
    message?: string;
}