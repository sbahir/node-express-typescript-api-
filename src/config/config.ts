import * as dotenv from 'dotenv';
import * as path from 'path';
import * as Joi from 'joi';
import {existsSync} from "fs"

// relative to /built/src
let envPath = path.join(__dirname, '../../../.env')

// jest is relative to /src
if (!existsSync(envPath)) {
  envPath = path.join(__dirname, '../../.env')
}

dotenv.config({ path: envPath });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
const env = envVars.NODE_ENV as 'production' | 'development' | 'test';
const port = envVars.PORT as number;
const mongoose = {
  url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
  options: {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};
const jwt = {
  secret: envVars.JWT_SECRET as string,
  accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES as number,
  refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS as number,
  resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES as number,
  verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES as number,
};
const email = {
  smtp: {
    host: envVars.SMTP_HOST as string,
    port: envVars.SMTP_PORT as number,
    auth: {
      user: envVars.SMTP_USERNAME as string,
      pass: envVars.SMTP_PASSWORD as string,
    },
  },
  from: envVars.EMAIL_FROM as string,
};
export default {
  env,
  port,
  mongoose,
  jwt,
  email,
};
