import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LikesStatus } from '../../features/posts/models/output/PostsViewModel';
import { Post } from './post.entity';
import { User } from './user.entity';
import { Comment } from './comments.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  postId: string;

  @Column({ nullable: true })
  commentId: string;

  @Column()
  status: LikesStatus;

  @Column()
  createdAt: string;

  @ManyToOne(() => User, (u) => u.like)
  user: User;

  @ManyToOne(() => Post, (p) => p.like)
  post: Post;

  @ManyToOne(() => Comment, (c) => c.like)
  comment: Comment;

  // @OneToOne(() => User)
  // @JoinColumn()
  // user: User;
}
