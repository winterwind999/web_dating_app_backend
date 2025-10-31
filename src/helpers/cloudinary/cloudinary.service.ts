import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    const CLOUDINARY_CLOUDNAME = this.configService.get<string>(
      'CLOUDINARY_CLOUDNAME',
    );
    const CLOUDINARY_API_KEY =
      this.configService.get<string>('CLOUDINARY_API_KEY');
    const CLOUDINARY_API_SECRET = this.configService.get<string>(
      'CLOUDINARY_API_SECRET',
    );

    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUDNAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  }

  uploadBuffer(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          type: 'authenticated',
          folder: folder || undefined,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (!result) {
            return reject(
              new InternalServerErrorException('Empty Cloudinary result'),
            );
          }
          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(stream);
    });
  }

  async destroyMedia(public_id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(public_id, (error, result) => {
        if (error) {
          return reject(error);
        }
        if (result.result !== 'ok' && result.result !== 'not found') {
          return reject(
            new InternalServerErrorException('Failed to delete asset'),
          );
        }
        resolve(result);
      });
    });
  }
}
