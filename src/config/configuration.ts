import { defaultParseInt } from 'src/common/utils/default-parse-int';
import { Config } from './interfaces/config.interface';

export const configuration = (): Config => ({
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  frontendUrl: process.env.FRONTEND_URL,
  tokenOptions: {
    access: {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: defaultParseInt(process.env.ACCESS_TOKEN_EXPIRES_IN),
    },
    refresh: {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: defaultParseInt(process.env.REFRESH_TOKEN_EXPIRES_IN),
    },
    changeEmail: {
      secret: process.env.CHANGE_EMAIL_TOKEN_SECRET,
      expiresIn: defaultParseInt(process.env.CHANGE_EMAIL_TOKEN_EXPIRES_IN),
    },
    resetPassword: {
      secret: process.env.RESET_PASSWORD_TOKEN_SECRET,
      expiresIn: defaultParseInt(process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN),
    },
    deleteAccount: {
      secret: process.env.DELETE_ACCOUNT_TOKEN_SECRET,
      expiresIn: defaultParseInt(process.env.DELETE_ACCOUNT_TOKEN_EXPIRES_IN),
    },
  },
  mailer: {
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secret: process.env.AWS_SECRET,
    cloudfrontUrl: process.env.AWS_CLOUDFRONT_URL,
    s3: {
      region: process.env.AWS_S3_REGION,
      bucked: process.env.AWS_S3_BUCKED,
    },
  },
});
