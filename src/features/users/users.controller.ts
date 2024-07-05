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
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.servis';
import { QueryUserModel } from './models/input/QueryUserModule';
import { UsersQueryRepository } from './users.query.repository';
import { CreateUserModel } from './models/input/CreateUserModel';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { mapServiceCodeToHttpStatus } from '../auth/mapper/status-code-mapper';
import {UserIdModel} from "./models/input/UserIdModel";

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
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

    return mapServiceCodeToHttpStatus(newUser);
  }
  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param() userId: UserIdModel) {
    const deleteUser = await this.usersService.deleteUserById(userId.userId);
    if (deleteUser === false) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return deleteUser;
  }
}
