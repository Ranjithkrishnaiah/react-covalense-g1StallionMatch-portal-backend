import {
  Injectable,
  UnprocessableEntityException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import * as mime from 'mime-types';

@Injectable()
export class FileUploadsService {
  constructor(private readonly configService: ConfigService) {}
  //Allowed ImageMimeTypes
  private allowedImageTypes = ['png', 'jpg', 'jpeg'];
  //Allowed VideoTypes
  private allowedVideoTypes = ['mp4'];
  //Allowed FileTypes
  private allowedFileTypes = ['doc', 'docx', 'pdf', 'xlsx'];
  //Allowed CSV
  private allowedCvsFileTypes = ['csv'];

  //Get Presigned Url By fileKey
  public async generateGetPresignedUrl(key: string) {
    const s3 = new S3();
    return await s3.getSignedUrlPromise('getObject', {
      Bucket: this.configService.get('file.awsDefaultS3Bucket'),
      Key: key,
      Expires: this.configService.get('file.awsFileDownloadUrlExpires'),
    });
  }

  //Get Presigned Url - For Upload
  public async generatePutPresignedUrl(key: string, fileType: string) {
    const s3 = new S3();
    return await s3.getSignedUrlPromise('putObject', {
      Bucket: this.configService.get('file.awsDefaultS3Bucket'),
      Key: key,
      ContentType: fileType,
      Expires: this.configService.get('file.awsFileUploadUrlExpires'),
      ACL: 'public-read',
    });
  }

  //Upload CSV to S3 Bucket
  public async uploadCsvFileToS3Bucket(params, callback) {
    const s3 = new S3();
    await s3.upload(params, (error, data) => {
      if (error) {
        callback(error, null);
      }
      callback(null, data);
    });
  }

  //Remove file from S3 Bucket
  public async removeFileFromS3(key) {
    const s3 = new S3();
    const params = {
      Bucket: this.configService.get('file.awsDefaultS3Bucket'),
      Key: key,
    };
    return await s3.deleteObject(params, (error, data) => {
      if (error) {
        console.log('Error in file delete to S3', error);
      }
      console.log('File deleted successfully', data);
    });
  }

  //Allowed image types
  async allowOnlyImages(fileType: string) {
    const extension = await mime.extension(fileType);
    if (!this.allowedImageTypes.includes(extension)) {
      throw new UnprocessableEntityException('Only image files are allowed!');
    }
  }

  //Allowed only video and image types
  async allowOnlyVideosAndImages(fileType: string) {
    const extension = await mime.extension(fileType);
    let allowedTypes = this.allowedImageTypes.concat(this.allowedVideoTypes);
    if (!allowedTypes.includes(extension)) {
      throw new UnprocessableEntityException(
        'Only video/image files are allowed!',
      );
    }
  }

  //Allow only image and files
  async allowOnlyImagesAndFiles(fileType: string) {
    const extension = await mime.extension(fileType);
    let allowedTypes = this.allowedImageTypes.concat(this.allowedFileTypes);
    if (!allowedTypes.includes(extension)) {
      throw new UnprocessableEntityException('Only File/image are allowed!');
    }
  }
  //Allow only csv files
  async allowOnlyCsvFile(fileType: string) {
    const extension = await mime.extension(fileType);
    if (!this.allowedCvsFileTypes.includes(extension)) {
      throw new UnprocessableEntityException('Only csv are allowed!');
    }
  }
  //Validate Uploaded file size
  async validateFileSize(fileType: string, fileSize: number) {
    const extension = await mime.extension(fileType);
    if (this.allowedImageTypes.includes(extension)) {
      if (fileSize < this.configService.get('file.minImageSizeAllowed')) {
        throw new UnprocessableEntityException(
          'Image minimum size criteria not matched!',
        );
      }
      if (fileSize > this.configService.get('file.maxImageSizeAllowed')) {
        throw new UnprocessableEntityException(
          'Image maximum size criteria not matched!',
        );
      }
    } else if (this.allowedVideoTypes.includes(extension)) {
      if (fileSize < this.configService.get('file.minVideoSizeAllowed')) {
        throw new UnprocessableEntityException(
          'Video minimum size criteria not matched!',
        );
      }
      if (fileSize > this.configService.get('file.maxVideoSizeAllowed')) {
        throw new UnprocessableEntityException(
          'Video maximum size criteria not matched!',
        );
      }
    } else if (this.allowedFileTypes.includes(extension)) {
      if (fileSize < this.configService.get('file.minFileSizeAllowed')) {
        throw new UnprocessableEntityException(
          'File minimum size criteria not matched!',
        );
      }
      if (fileSize > this.configService.get('file.maxFileSizeAllowed')) {
        throw new UnprocessableEntityException(
          'File maximum size criteria not matched!',
        );
      }
    }
  }
  //Upload file to S3
  async uploadFileToS3(fileName: string, fileData: Buffer, mimeType: string) {
    try {
      let params = {
        Bucket: this.configService.get('file.awsDefaultS3Bucket'),
        Body: fileData,
        Key: fileName,
        ContentType: mimeType,
      };
      const s3 = new S3();
      return await s3.upload(params).promise();
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }
  //Presigned Url With Custom expire time
  public async generateUrlWithCustomExpireTime(key: string) {
    const s3 = new S3();
    return await s3.getSignedUrlPromise('getObject', {
      Bucket: this.configService.get('file.awsDefaultS3Bucket'),
      Key: key,
      Expires: this.configService.get(
        'file.awsFileDownloadUrlExpiresForOneYear',
      ),
    });
  }
  //Get S3 file Data by fileName
  async getFileData(fileName: string): Promise<Buffer> {
    const s3 = new S3();
    const params = {
      Bucket: this.configService.get('file.awsDefaultS3Bucket'),
      Key: fileName,
    };
    const { Body } = await s3.getObject(params).promise();
    return Body as Buffer;
  }

  //Get S3 File Object
  async getS3FileObject(key: string) {
    try {
      const s3 = new S3();
      // Fetch the file from the specified S3 bucket and key
      const getObjectParams = {
        Bucket: this.configService.get('file.awsDefaultS3Bucket'),
        Key: key,
      };
      return await s3.getObject(getObjectParams).promise();
    } catch (error) {
      throw new UnprocessableEntityException('File not exist!');
    }
  }
}
