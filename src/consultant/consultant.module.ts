import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsultantService } from './consultant.service';
import { ConsultantRepository } from './consultant.repository';
import { Consultant, ConsultantSchema } from './consultant.shema';

@Module({
  exports: [ConsultantService],
  providers: [ConsultantService, ConsultantRepository],
  imports: [
    MongooseModule.forFeature([
      { name: Consultant.name, schema: ConsultantSchema },
    ]),
  ],
})
export class ConsultantModule {}
