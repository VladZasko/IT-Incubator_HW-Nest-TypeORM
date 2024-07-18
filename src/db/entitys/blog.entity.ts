import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RefreshTokenMeta } from './refresh.token.meta.entity';
import { Post } from './post.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column()
  isMembership: boolean;

  @Column()
  createdAt: string;

  @OneToMany(() => Post, (p) => p.blog)
  post: Post;
}
