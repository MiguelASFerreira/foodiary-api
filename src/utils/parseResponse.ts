import type { HttpResponse } from "../types/Http";

export function parseResposnse({ statusCode, body }: HttpResponse) {

  return {
    statusCode,
    body: body ? JSON.stringify(body) : undefined,
  };
}