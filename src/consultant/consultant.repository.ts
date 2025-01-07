import { Injectable } from '@nestjs/common';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Consultant, ConsultantDocument } from './consultant.shema';

@Injectable()
export class ConsultantRepository {
  constructor(
    @InjectModel(Consultant.name)
    private consultantModel: Model<ConsultantDocument>,
  ) {}

  public async findOne(query: FilterQuery<Consultant>): Promise<Consultant> {
    return this.consultantModel.findOne(query);
  }

  public async find(query: FilterQuery<Consultant>): Promise<Consultant[]> {
    return this.consultantModel.find(query);
  }

  public async create(consultant: {
    email: string;
    displayName: string;
    token: string;
  }): Promise<Consultant> {
    const newConsultant = new this.consultantModel(consultant);
    return newConsultant.save();
  }
  public async findOneAndUpdate(
    query: FilterQuery<Consultant>,
    consultant: Partial<Consultant>,
  ): Promise<Consultant> {
    return this.consultantModel.findOneAndUpdate(query, consultant);
  }
}
