import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './blog.entity';
import { Post } from './post.entity';
import { User } from './user.entity';
import { Like } from './like.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  postId: string;

  @Column()
  userId: string;

  @Column()
  content: string;

  @Column()
  createdAt: string;

  @ManyToOne(() => User, (u) => u.comment)
  user: User;

  @ManyToOne(() => Post, (p) => p.comment)
  post: Post;

  @OneToMany(() => Like, (l) => l.comment)
  like: Like;

  // @OneToOne(() => User)
  // @JoinColumn()
  // user: User;
}
