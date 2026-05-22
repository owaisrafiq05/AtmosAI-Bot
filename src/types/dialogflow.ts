export interface DialogflowWebhookRequest {
  responseId?: string;
  session?: string;
  queryResult?: DialogflowQueryResult;
  originalDetectIntentRequest?: {
    payload?: Record<string, unknown>;
  };
}

export interface DialogflowQueryResult {
  queryText?: string;
  parameters?: Record<string, unknown>;
  intent?: {
    name?: string;
    displayName?: string;
  };
  intentDetectionConfidence?: number;
  languageCode?: string;
}

export interface DialogflowWebhookResponse {
  fulfillmentText?: string;
  fulfillmentMessages?: Array<{
    text?: { text: string[] };
  }>;
}
