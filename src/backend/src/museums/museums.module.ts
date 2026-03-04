import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MuseumsController } from './museums.controller';
import { MuseumsService } from './museums.service';
import { Museum, MuseumSchema } from './schemas/museum.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Museum.name, schema: MuseumSchema },
    ]),
  ],
  controllers: [MuseumsController],
  providers: [MuseumsService],
  exports: [MuseumsService],
})
export class MuseumsModule {}