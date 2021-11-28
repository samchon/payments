import toss from "../../api";
import { Configuration } from "../../Configuration";

if (typeof btoa === "undefined")
    global.btoa = function (str: string) 
    {
        return Buffer.from(str).toString("base64");
    };

export namespace TestConnection
{
    export const FAKE: toss.IConnection = {
        host: `http://127.0.0.1:${Configuration.API_PORT}`
    };
    
    export const REAL: toss.IConnection = {
        host: `https://api.tosspayments.com/v1`,
        headers: {
            "Authorization": `Basic ${btoa("test_ak_ZORzdMaqN3wQd5k6ygr5AkYXQGwy")}`,
        }
    };
}