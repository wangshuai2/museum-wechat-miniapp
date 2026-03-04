import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FootprintsController } from './footprints.controller';
import { FootprintsService } from './footprints.service';
import { Footprint, FootprintSchema } from './schemas/footprint.schema';
import { Museum, MuseumSchema } from '../museums/schemas/museum.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Footprint.name, schema: FootprintSchema },
      { name: Museum.name, schema: MuseumSchema },
    ]),
  ],
  controllers: [FootprintsController],
  providers: [FootprintsService],
  exports: [FootprintsService],
})
export class FootprintsModule {}