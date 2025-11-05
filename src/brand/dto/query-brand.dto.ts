import { IsOptional, IsString } from 'class-validator';

export class QueryBrandDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
