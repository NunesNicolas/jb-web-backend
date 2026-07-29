import { randomUUID } from 'crypto';

export enum UserProfile {
  Admin = 'admin',
  Operations = 'operations',
  Finance = 'finance',
}

export type UserProps = {
  name: string;
  email: string;
  phone: string;
  profile: UserProfile;
  passwordHash: string;
};

export class User {
  uuid: string;
  name: string;
  email: string;
  phone: string;
  profile: UserProfile;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: UserProps) {
    const now = new Date();

    this.uuid = randomUUID();
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.profile = props.profile;
    this.passwordHash = props.passwordHash;
    this.createdAt = now;
    this.updatedAt = now;
  }
}
