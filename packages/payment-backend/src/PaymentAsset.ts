import iamport from "iamport-server-api";
import toss from "toss-payments-server-api";

import { IamportAsset } from "./services/iamport/IamportAsset";
import { TossAsset } from "./services/toss/TossAsset";

export namespace PaymentAsset {
    export function toss_connection(
        storeId: string,
    ): Promise<toss.IConnection> {
        return TossAsset.connection(storeId);
    }

    export function iamport_connection(
        storeId: string,
    ): Promise<iamport.IConnection> {
        return IamportAsset.connection(storeId);
    }
}
