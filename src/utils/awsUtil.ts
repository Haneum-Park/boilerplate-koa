import AWS from 'aws-sdk';
import crypto from 'crypto';
import fs from 'fs';
import { File } from 'formidable';

import AWS_S3_CONFIG from '@config/awsConfig';

import { UploadFile } from './awsUtil.interface';

AWS.config.update({
  accessKeyId: AWS_S3_CONFIG.accessKeyId,
  secretAccessKey: AWS_S3_CONFIG.secretAccessKey,
  region: AWS_S3_CONFIG.region,
});

namespace AWS_UTIL {
  const S3: AWS.S3 = new AWS.S3();
  const Bucket = AWS_S3_CONFIG.bucket;

  export const uploadFile = async (
    file: File, prefix = '',
  ): Promise<[UploadFile, string]> => {
    const extRe = /(?:\.([^.]+))?$/;
    const name = file.originalFilename as string;
    const fileExt = extRe.exec(name)?.[1] || '';
    const ext = (fileExt === '') ? '' : `.${fileExt}`;
    const hash = crypto.createHash('sha512')
      .update(name.toString())
      .update(file.size.toString())
      .update(Date.now().toString())
      .digest('hex');
    const prefixString = prefix.length > 0 ? prefix : '';
    const path = `${prefixString}/${hash}${ext}`;

    const fileBuffer = fs.readFileSync(file.filepath);

    const params = {
      Bucket,
      Key: path,
      ACL: 'public-read-write',
      Body: fileBuffer,
      ContentType: (file.mimetype as string).indexOf('image') === -1 ? file.mimetype as string : 'application/octet-stream',
    };

    const location: Record<string, string> = await new Promise((resolve, reject) => {
      S3.upload(params, (err: any, data: any) => (err == null ? resolve(data) : reject(err)));
    });
    const Location = location.Location as string;
    const retData = {
      name,
      mimetype: (file.mimetype as string),
      hash,
      Bucket,
      Key: path,
    };

    return [retData, Location];
  };

  export async function uploadImage(image: File, prefix = ''): Promise<UploadFile> {
    const [params] = await uploadFile(image, prefix);
    return params;
  }

  export async function deleteFile(Key: string): Promise<boolean> {
    await new Promise((resolve, reject) => {
      S3.deleteObject(
        { Bucket, Key }, (err: any, data: any) => (err == null ? resolve(data) : reject(err)),
      );
    });
    return true;
  }

  export async function getUrl(Key: string): Promise<string> {
    const res = await S3.getSignedUrlPromise('getObject', { Bucket, Key });
    return res;
  }
}

export default AWS_UTIL;
