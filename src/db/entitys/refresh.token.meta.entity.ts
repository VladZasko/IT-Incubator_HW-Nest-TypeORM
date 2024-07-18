import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RefreshTokenMeta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  deviceName: string;

  @Column()
  ip: string;

  @Column()
  deviceId: string;

  @Column()
  issuedAt: string;

  @ManyToOne(() => User, (u) => u.refreshTokenMeta)
  user: User;
}
