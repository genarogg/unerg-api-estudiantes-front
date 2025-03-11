const DEBUG = false



const PUBLIC_NEXT_URL_BACKEND_DEV_SERVER_DEV = "http://localhost:4000"
const PUBLIC_NEXT_URL_BACKEND_DEV_SERVER_PROD = "https://unerg-api.unerg.tech"

/* GOOGLE */
const RECAPTCHA_KEY = "6Le6Hs4qAAAAALpq7YSNCUHfRp0aP13UbUBcHXdt"

const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === "production";

const URL_BACKEND = isProd ? PUBLIC_NEXT_URL_BACKEND_DEV_SERVER_PROD : PUBLIC_NEXT_URL_BACKEND_DEV_SERVER_DEV;

export {
    isProd,
    DEBUG,
    URL_BACKEND,
    RECAPTCHA_KEY,
};

