import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class PasswordRecovery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @PrimaryColumn()
  userId: string;

  @Column()
  expirationDate: string;

  @Column()
  recoveryCode: string;

  @OneToOne(() => User, (u) => u.passwordRecovery)
  @JoinColumn()
  user: User;
}
