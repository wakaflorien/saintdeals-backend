import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

//  update avatar
export class updateAvatarDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Avatar image file',
  })
  @IsOptional()
  avatar?: Express.Multer.File;
}
