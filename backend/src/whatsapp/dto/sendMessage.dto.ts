import { IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  id: string;

  @IsString()
  text: string;
}
