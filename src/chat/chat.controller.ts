import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('chat')
export class ChatController {
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
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
        return {
            message: 'File uploaded successfully',
            filename: file.filename,
            url: `http://localhost:3000/uploads/${file.filename}`, // Adjust the URL as per your server configuration
        };
    }
}

