import { APIGatewayProxyEventV2 } from "aws-lambda";

import { parseResposnse } from "../utils/parseResponse";
import { parseProtectedEvent } from "../utils/parseProtectedEvent";
import { unauthorized } from "../utils/http";
import { GetMealByIdController } from "../controllers/GetMealByIdController";

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const request = parseProtectedEvent(event);
    const response = await GetMealByIdController.handle(request)
    return parseResposnse(response);
  } catch  {
    return parseResposnse(unauthorized({
      error: 'Invalid access token'
    }))
  }
}