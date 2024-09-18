import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly description: string;

  @IsString()
  readonly price: string;

  @IsOptional()
  @IsString()
  image?: string; // Optional field for the image

  @IsNotEmpty()
  @IsString()
  warranty_expire_at: string;
}
