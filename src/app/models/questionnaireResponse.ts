export interface Item {
  linkId: string;
  definition?: string;
  text: string;
  answer?: [
    {
      valueBoolean?: boolean;
      valueDecimal?: string;
      valueInteger?: string;
      valueDate?: Date;
      valueDateTime?: string;
      valueTime?: string;
      valueString?: string;
      valueUri?: string;
      valueAttachment?: any;
      valueCoding?: any;
      valueQuantity?: any;
      valueReference?: any;
      item?: Item[];
    }
  ];
  item?: Item[];
}
export interface QuestionnaireResponse {
  resourceType: string;
  identifier: string;
  basedOn?: any[];
  partOf?: any[];
  questionnaire?: any;
  status: string;
  subject: any;
  encounter?: any;
  authored?: string;
  author?: any;
  source?: any;
  item?: Item[];
}
