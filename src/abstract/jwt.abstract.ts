export abstract class JwtAbstract {
    /**
     *
     * @param hours
     * @param date
     * @protected
     */
    protected abstract addHourToken(hours: number, date: Date): Date;

    /**
     *
     * @param user
     * @param privateKey
     */
    public abstract accessToken(user: any, privateKey: string): Object;
}
