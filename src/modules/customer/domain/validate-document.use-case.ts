import { Injectable } from '@nestjs/common';
import { Document, DocumentType } from './value-objects/document.vo';

export interface ValidateDocumentInput {
  document: string;
}

export interface ValidateDocumentOutput {
  valid: boolean;
  type: DocumentType;
  normalized: string;
}

@Injectable()
export class ValidateDocumentUseCase {
  execute(input: ValidateDocumentInput): ValidateDocumentOutput {
    const doc = Document.create(input.document);

    return {
      valid: true,
      type: doc.type,
      normalized: doc.value,
    };
  }
}
