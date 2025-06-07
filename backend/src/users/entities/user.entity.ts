export class User {
  userId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    userId: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.userId = userId;
    this.email = email;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
