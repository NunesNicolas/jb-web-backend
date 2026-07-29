import { randomUUID } from 'crypto';

export enum WorkStatus {
  Planning = 'planning',
  InProgress = 'in_progress',
  Paused = 'paused',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export type WorkProps = {
  ownerUserUuid: string;
  name: string;
  address: string;
  longitude: number;
  latitude: number;
  estimatedPrice: number;
  finalBudget: number;
  status: WorkStatus;
};

export class Work {
  uuid: string;
  ownerUserUuid: string;
  name: string;
  address: string;
  longitude: number;
  latitude: number;
  estimatedPrice: number;
  finalBudget: number;
  status: WorkStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: WorkProps) {
    const now = new Date();

    this.uuid = randomUUID();
    this.ownerUserUuid = props.ownerUserUuid;
    this.name = props.name;
    this.address = props.address;
    this.longitude = props.longitude;
    this.latitude = props.latitude;
    this.estimatedPrice = props.estimatedPrice;
    this.finalBudget = props.finalBudget;
    this.status = props.status;
    this.createdAt = now;
    this.updatedAt = now;
  }
}
