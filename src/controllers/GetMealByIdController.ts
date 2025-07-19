import z from "zod";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "../db";
import type { HttpResponse, ProtectedHttpRequest } from "../types/Http";
import { badRequest, ok } from "../utils/http";
import { mealsTable } from "../db/schema";

const schema = z.object({
  mealId: z.uuid()
})


export class GetMealByIdController {
  static async handle({ userId, params }: ProtectedHttpRequest): Promise<HttpResponse> {
    const { success, error, data } = schema.safeParse(params)
            
    if (!success) {
      return badRequest({
        errors: error.issues
      })
    }

    const meal = await db.query.mealsTable.findFirst({
      columns: {
        id: true,
        foods: true,
        createdAt: true,
        icon: true,
        name: true,
        status: true,
      },
      where: and(
        eq(mealsTable.userId, userId),
        eq(mealsTable.id, data.mealId),
      ),
    })

    return ok({ meal })
  }
}