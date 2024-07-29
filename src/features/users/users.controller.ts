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
  Scope,
  UseGuards,
} from '@nestjs/common';
import { QueryUserModel } from './models/input/QueryUserModule';
import { UsersQueryRepository } from './repository/users.query.repository';
import { CreateUserModel } from './models/input/CreateUserModel';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { UserIdModel } from './models/input/UserIdModel';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserSaCommand } from './application/use-cases/create.user.sa.use.case';
import { DeleteUserSaCommand } from './application/use-cases/delete.user.sa.use.case';

@UseGuards(BasicAuthGuard)
@Controller({ path: 'sa/users', scope: Scope.REQUEST })
export class UsersController {
  private readonly usersQueryRepository;
  private commandBus;

  constructor(
    usersQueryRepository: UsersQueryRepository,
    commandBus: CommandBus,
  ) {
    this.usersQueryRepository = usersQueryRepository;
    this.commandBus = commandBus;
    console.log('CONTROLLER created');
  }
  @Get()
  async getUsers(@Query() query: QueryUserModel) {
    return await this.usersQueryRepository.getAllUsers(query);
  }
  @Post()
  async createUser(@Body() inputModel: CreateUserModel) {
    return this.commandBus.execute(new CreateUserSaCommand(inputModel));
  }
  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param() userId: UserIdModel) {
    //const deleteUser = await this.usersService.deleteUserById(userId.userId);

    const deleteUser = await this.commandBus.execute(
      new DeleteUserSaCommand(userId.userId),
    );

    if (deleteUser === false) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return deleteUser;
  }
}
