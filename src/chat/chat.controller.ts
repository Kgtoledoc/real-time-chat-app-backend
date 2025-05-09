import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer, { diskStorage } from 'multer';
import { extname } from 'path';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';

@Controller('chat')
export class ChatController {
    
    constructor() {
        if (process.env.STORAGE_TYPE === 's3') {
            AWS.config.update({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.AWS_REGION,
            });
        }
    }   
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: process.env.STORAGE_TYPE === 's3' ?
        multerS3({
            s3:  new AWS.S3({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.AWS_REGION,
            }),
            bucket: process.env.S3_BUCKET_NAME,
            acl: 'public-read',
            key: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                const filename = `uploads/${uniqueSuffix}${ext}`;
                callback(null, filename);
            }
        })
        : diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = extname(file.originalname);
                const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
                cb(null, filename);
            }
        }),
        limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new BadRequestException('Invalid Type!'), false);
            }
            cb(null, true);
        },
    }),
    )
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File not uploaded');
        }
        const fileUrl = process.env.STORAGE_TYPE === 's3' ?
            `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.filename}` :
            `http://localhost:3000/uploads/${file.filename}`; // Adjust the URL as per your server configuration
        return {
            message: 'File uploaded successfully',
            filename: file.filename,
            url: fileUrl // Adjust the URL as per your server configuration
        };
    }
}

