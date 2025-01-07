import { Injectable } from '@nestjs/common';
import { Consultant } from './consultant.shema';
import { ConsultantRepository } from './consultant.repository';

@Injectable()
export class ConsultantService {
  constructor(private readonly consultantRepository: ConsultantRepository) {}

  public async getConsultantByEmail(email: string): Promise<Consultant> {
    return this.consultantRepository.findOne({ email });
  }

  public async getAllConsultants(): Promise<Consultant[]> {
    return this.consultantRepository.find({});
  }

  public async createConsultant(
    email: string,
    displayName: string,
    token: string,
  ): Promise<Consultant> {
    return this.consultantRepository.create({ email, displayName, token });
  }

  public async updateConsultant(
    email: string,
    updates: Partial<Consultant>,
  ): Promise<Consultant> {
    return this.consultantRepository.findOneAndUpdate({ email }, updates);
  }
}
