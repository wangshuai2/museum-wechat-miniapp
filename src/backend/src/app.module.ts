import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MuseumsModule } from './museums/museums.module';
import { FootprintsModule } from './footprints/footprints.module';
import { NotesModule } from './notes/notes.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // 数据库连接
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    
    // 业务模块
    AuthModule,
    UsersModule,
    MuseumsModule,
    FootprintsModule,
    NotesModule,
    FavoritesModule,
  ],
})
export class AppModule {}