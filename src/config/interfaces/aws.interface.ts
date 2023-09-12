interface AwsS3 {
  region: string;
  bucked: string;
}

export interface Aws {
  accessKeyId: string;
  secret: string;
  cloudfrontUrl: string;
  s3: AwsS3;
}
