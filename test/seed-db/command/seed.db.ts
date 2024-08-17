import { Injectable } from '@nestjs/common';
import { Command, Positional } from 'nestjs-command';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../../src/db/entitys/blog.entity';
import { Repository } from 'typeorm';
import { Post } from '../../../src/db/entitys/post.entity';
import { User } from '../../../src/db/entitys/user.entity';
import { Comment } from '../../../src/db/entitys/comments.entity';
import { Like } from '../../../src/db/entitys/like.entity';
import { v4 as uuidv4 } from 'uuid';
import { EmailConfirmation } from '../../../src/db/entitys/email.confirmatiom.entity';
import { add } from 'date-fns/add';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { LikesStatus } from '../../../src/features/posts/models/output/PostsViewModel';

@Injectable()
export class SeedDb {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(EmailConfirmation)
    private readonly emailConfirmationRepository: Repository<EmailConfirmation>,
  ) {}

  @Command({
    command: 'seed:db <countUser> <countBlog>',
    describe: 'create a vinyl',
  })
  async create(
    @Positional({
      name: 'countUser',
      describe: 'the count user',
      type: 'number',
    })
    countUser: number,
    @Positional({
      name: 'countBlog',
      describe: 'the count blog',
      type: 'number',
    })
    countBlog: number,
  ) {
    const users = {};
    for (let i = 1; i <= countUser; i++) {
      const passwordSalt = await bcrypt.genSalt(10);

      const newUser = new User();

      newUser.id = uuidv4();
      newUser.login = faker.internet.userName();
      newUser.email = faker.internet.email();
      newUser.createdAt = faker.date
        .past({
          years: 10,
        })
        .toISOString();

      const passwordHash: string = await bcrypt.hash(
        `${newUser.login}123`,
        passwordSalt,
      );

      newUser.passwordHash = passwordHash;
      newUser.passwordSalt = passwordSalt;

      const emailConfirmation = new EmailConfirmation();

      emailConfirmation.id = uuidv4();
      emailConfirmation.confirmationCode = uuidv4();
      emailConfirmation.expirationDate = add(new Date(), {
        minutes: 15,
      }).toISOString();
      emailConfirmation.isConfirmed = faker.datatype.boolean(0.75);
      emailConfirmation.userId = newUser.id;

      users[i] = newUser;
      await this.usersRepository.save(newUser);

      await this.emailConfirmationRepository.save(emailConfirmation);
    }

    const blogs = {};
    for (let i = 1; i <= countBlog; i++) {
      const newBlog: Blog = new Blog();

      newBlog.id = uuidv4();
      newBlog.name = faker.word.words({ count: { min: 1, max: 3 } });
      newBlog.description = faker.word.words({ count: { min: 10, max: 30 } });
      newBlog.websiteUrl = faker.internet.url();
      newBlog.createdAt = faker.date
        .past({
          years: 9,
        })
        .toISOString();
      newBlog.isMembership = false;
      blogs[i] = newBlog;
      await this.blogRepository.save(newBlog);

      for (let j = 1; j <= faker.number.int({ min: 0, max: 10 }); j++) {
        const newPostByBlog = new Post();

        newPostByBlog.id = uuidv4();
        newPostByBlog.blogId = newBlog.id;
        newPostByBlog.title = faker.word.words({ count: { min: 1, max: 3 } });
        newPostByBlog.content = faker.word.words({
          count: { min: 10, max: 30 },
        });
        newPostByBlog.shortDescription = faker.word.words({
          count: { min: 3, max: 6 },
        });
        newPostByBlog.createdAt = faker.date
          .between({ from: newBlog.createdAt, to: new Date().toISOString() })
          .toISOString();

        await this.postRepository.save(newPostByBlog);
        console.log(newPostByBlog);
        for (let t = 1; t <= faker.number.int({ min: 0, max: 50 }); t++) {
          const newLikeStatus = faker.helpers.enumValue(LikesStatus);
          const userId = users[faker.number.int({ min: 1, max: countUser })].id;

          const findLikeOrDislike = await this.likeRepository
            .createQueryBuilder('l')
            .where('l.postId = :postId', { postId: newPostByBlog.id })
            .andWhere('l.userId = :userId', {
              userId: userId,
            })
            .getOne();

          if (!findLikeOrDislike) {
            if (newLikeStatus !== LikesStatus.None) {
              const newLike = new Like();

              newLike.id = uuidv4();
              newLike.createdAt = faker.date
                .between({
                  from: newPostByBlog.createdAt,
                  to: new Date().toISOString(),
                })
                .toISOString();
              newLike.postId = newPostByBlog.id;
              newLike.userId = userId;
              newLike.status = newLikeStatus;

              await this.likeRepository.save(newLike);
            }
          } else if (findLikeOrDislike.status !== newLikeStatus) {
            findLikeOrDislike.status = newLikeStatus;
            await this.likeRepository.save(findLikeOrDislike);
          }
        }

        for (let o = 1; o <= faker.number.int({ min: 0, max: 10 }); o++) {
          const newComment = new Comment();

          newComment.id = uuidv4();
          newComment.content = faker.word.words({
            count: { min: 10, max: 30 },
          });
          newComment.userId =
            users[faker.number.int({ min: 1, max: countUser })].id;
          newComment.createdAt = faker.date
            .between({
              from: newPostByBlog.createdAt,
              to: new Date().toISOString(),
            })
            .toISOString();
          newComment.postId = newPostByBlog.id;

          await this.commentRepository.save(newComment);
          console.log(newComment);
          for (let t = 1; t <= faker.number.int({ min: 0, max: 50 }); t++) {
            const newLikeStatus = faker.helpers.enumValue(LikesStatus);
            const userId =
              users[faker.number.int({ min: 1, max: countUser })].id;
            const findLikeOrDislike = await this.likeRepository
              .createQueryBuilder('l')
              .where('l.commentId = :commentId', { commentId: newComment.id })
              .andWhere('l.userId = :userId', { userId: userId })
              .getOne();

            if (!findLikeOrDislike) {
              if (newLikeStatus !== LikesStatus.None) {
                const newLike = new Like();

                newLike.id = uuidv4();
                newLike.createdAt = faker.date
                  .between({
                    from: newComment.createdAt,
                    to: new Date().toISOString(),
                  })
                  .toISOString();
                newLike.commentId = newComment.id;
                newLike.userId = userId;
                newLike.status = newLikeStatus;

                await this.likeRepository.save(newLike);
              }
            } else if (findLikeOrDislike.status !== newLikeStatus) {
              findLikeOrDislike.status = newLikeStatus;
              await this.likeRepository.save(findLikeOrDislike);
            }
          }
        }
      }
    }
  }
}
