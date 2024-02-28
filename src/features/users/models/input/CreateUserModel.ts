import { Length, Matches } from 'class-validator';

export class CreateUserModel {
  /**
   * user login, email, password
   */
  @Length(3, 10)
  @Matches(`^[a-zA-Z0-9_-]*$`)
  login: string;

  @Matches(`^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$`)
  email: string;

  @Length(6, 20)
  password: string;
}
