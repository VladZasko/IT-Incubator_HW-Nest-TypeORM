import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './blog.entity';
import { Comment } from './comments.entity';
import { User } from './user.entity';
import { Like } from './like.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blogId: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @Column()
  createdAt: string;

  @ManyToOne(() => Blog, (b) => b.post)
  blog: Blog;

  @OneToMany(() => Comment, (c) => c.post)
  comment: Comment;

  @OneToMany(() => Like, (l) => l.post)
  like: Like;

  // @OneToOne(() => User)
  // @JoinColumn()
  // user: User;
}
