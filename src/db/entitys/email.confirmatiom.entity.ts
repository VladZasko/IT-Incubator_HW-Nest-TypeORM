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
export class EmailConfirmation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  confirmationCode: string;

  @Column()
  isConfirmed: boolean;

  @Column()
  expirationDate: string;

  @OneToOne(() => User, (u) => u.emailConfirmation)
  @JoinColumn()
  user: User;
}
