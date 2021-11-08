import session from 'koa-session';

declare module "koa-session" {
   interface opts extends Omit<Cookies.SetOption, 'maxAge'> {
        /**
         * cookie key (default is koa:sess)
         */
        key: string;

        /**
         * maxAge in ms (default is 1 days)
         * "session" will result in a cookie that expires when session/browser is closed
         * Warning: If a session cookie is stolen, this cookie will never expire
         */
        maxAge?: number | "session";

        /**
         * custom encode method
         */
        encode?: util["encode"];

        /**
         * custom decode method
         */
        decode?: util["decode"];

        /**
         * The way of generating external session id is controlled by the options.genid, which defaults to Date.now() + "-" + uid.sync(24).
         */
        genid?: () => string;

        /**
         * Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false
         */
        rolling?: boolean;

        /**
         * Renew session when session is nearly expired, so we can always keep user logged in. (default is false)
         */
        renew?: boolean;

        /**
         * You can store the session content in external stores(redis, mongodb or other DBs)
         */
        store?: stores;

        /**
         * External key is used the cookie by default,
         * but you can use options.externalKey to customize your own external key methods.
         */
        externalKey?: ExternalKeys;

        /**
         * If your session store requires data or utilities from context, opts.ContextStore is alse supported.
         * ContextStore must be a class which claims three instance methods demonstrated above.
         * new ContextStore(ctx) will be executed on every request.
         */
        ContextStore?: { new(ctx: Koa.Context): stores };

        /**
         * If you want to add prefix for all external session id, you can use options.prefix, it will not work if options.genid present.
         */
        prefix?: string;

        /**
         * Hook: valid session value before use it
         */
        valid?(ctx: Koa.Context, session: Partial<Session>): void;

        /**
         * Hook: before save session
         */
        beforeSave?(ctx: Koa.Context, session: Session): void;
    } 
}