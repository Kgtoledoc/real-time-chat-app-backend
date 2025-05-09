import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service'
import { ChatModule } from './chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EncryptionService } from './common/encryption.service';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app'),
    ChatModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, EncryptionService],
  exports: [EncryptionService],
  
})
export class AppModule {}
