import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.servis';
import { QueryUserModel } from './models/input/QueryUserModule';
import { UsersQueryRepository } from './users.query.repository';
import { CreateUserModel } from './models/input/CreateUserModel';
@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}
  @Get()
  async getUsers(@Query() query: QueryUserModel) {
    return await this.usersQueryRepository.getAllUsers(query);
  }
  @Post()
  async createUser(@Body() inputModel: CreateUserModel) {
    const newUser = await this.usersService.createUser(inputModel);

    return newUser;
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') userId: string) {
    const deleteUser = await this.usersService.deleteUserById(userId);
    if (deleteUser === false) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return deleteUser;
  }
}
