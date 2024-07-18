import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmailConfirmation } from './email.confirmatiom.entity';
import { PasswordRecovery } from './password.recovery.entity';
import { RefreshTokenMeta } from './refresh.token.meta.entity';
import { Comment } from './comments.entity';
import { Post } from './post.entity';
import { Like } from './like.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  createdAt: string;

  @Column()
  passwordHash: string;

  @Column()
  passwordSalt: string;

  @OneToOne(() => EmailConfirmation, (ec) => ec.user)
  emailConfirmation: EmailConfirmation;

  @OneToOne(() => PasswordRecovery, (pr) => pr.user)
  passwordRecovery: PasswordRecovery;

  @OneToMany(() => RefreshTokenMeta, (rtm) => rtm.user)
  refreshTokenMeta: RefreshTokenMeta;

  @OneToMany(() => Comment, (c) => c.user)
  comment: Comment;

  @OneToMany(() => Like, (l) => l.user)
  like: Like;
  // @OneToMany(() => Like, (l) => l.user)
  // likes: Like[];
}
