import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: any, { metatype }: ArgumentMetadata) {
    if (metatype === String) {
      return value;
    }

    if (value && typeof value === 'string') {
      const parsedDate = new Date(value);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      return parsedDate;
    }

    return value;
  }
}
