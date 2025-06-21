import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    example: 'admin@onsite360.com',
    description: 'The email of the user',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Admin@123',
    description: 'The password of the user',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
