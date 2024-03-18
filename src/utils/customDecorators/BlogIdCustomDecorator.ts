import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { BlogDBType, BlogDocument } from '../../db/schemes/blogs.schemes';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { BadRequestException, Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'IsRealBlogId', async: true })
@Injectable()
export class IsBlogIdExistConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectModel(BlogDBType.name) private blogModel: Model<BlogDocument>,
  ) {}
  async validate(blogId: string, args: ValidationArguments) {
    if (!ObjectId.isValid(blogId)) {
      throw new BadRequestException([
        { message: 'id incorrect', field: 'blogId' },
      ]);
    }
    const blogFind = await this.blogModel.findOne({
      _id: new ObjectId(blogId),
    });
    if (!blogFind) return false;
    return true;
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'blog dont exist';
  }
}

export function IsRealBlogId(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsBlogIdExistConstraint,
    });
  };
}
