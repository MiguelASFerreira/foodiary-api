import { APIGatewayProxyEventV2 } from "aws-lambda";

import { parseResposnse } from "../utils/parseResponse";
import { CreateMealController } from "../controllers/CreateMealController";
import { parseProtectedEvent } from "../utils/parseProtectedEvent";
import { unauthorized } from "../utils/http";

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const request = parseProtectedEvent(event);
    const response = await CreateMealController.handle(request)
    return parseResposnse(response);
  } catch  {
    return parseResposnse(unauthorized({
      error: 'Invalid access token'
    }))
  }
}