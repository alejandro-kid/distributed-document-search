import { StringValueObject } from '@/contexts/shared/domain/StringValueObject';
import { randomUUID } from 'crypto';

export class DocumentId extends StringValueObject {
  static generate(): DocumentId {
    return new DocumentId(randomUUID());
  }
}
