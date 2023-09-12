interface Options {
  secret: string;
  expiresIn: number;
}

export interface TokenOptions {
  access: Options;
  refresh: Options;
  changeEmail: Options;
  resetPassword: Options;
  deleteAccount: Options;
}
