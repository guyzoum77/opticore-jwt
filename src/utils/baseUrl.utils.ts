export class BaseUrlUtils {

    /**
     *
     * @param input
     */
    static base64UrlEncode(input: string): string {
        return Buffer.from(input)
            .toString("base64")
            .replace(/=+$/, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
    }

    /**
     *
     * @param input
     */
    static base64UrlDecode(input: string): string {
        input = input.replace(/-/g, "+").replace(/_/g, "/");
        while (input.length % 4) {
            input += "=";
        }
        return Buffer.from(input, "base64").toString();
    }
}