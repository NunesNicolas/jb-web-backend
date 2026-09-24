import { randomUUID } from 'crypto';

export enum ExpenseType {
  Material = 'material',
  Labor = 'labor',
  Marketing = 'marketing',
  Documentation = 'documentation',
}

export enum ExpenseStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export type ExpenseProps = {
  ownerUserUuid: string;
  workUuid: string;
  type: ExpenseType;
  status?: ExpenseStatus;
  name: string;
  description: string;
  amount: number;
  uploadUrl: string;
};

export class Expense {
  uuid: string;
  ownerUserUuid: string;
  workUuid: string;
  type: ExpenseType;
  status: ExpenseStatus;
  name: string;
  description: string;
  amount: number;
  uploadUrl: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: ExpenseProps) {
    const now = new Date();

    this.uuid = randomUUID();
    this.ownerUserUuid = props.ownerUserUuid;
    this.workUuid = props.workUuid;
    this.type = props.type;
    this.status = props.status ?? ExpenseStatus.Pending;
    this.name = props.name;
    this.description = props.description;
    this.amount = props.amount;
    this.uploadUrl = props.uploadUrl;
    this.createdAt = now;
    this.updatedAt = now;
  }
}
