import { z } from "zod";
import type { HttpRequest, HttpResponse } from "../types/Http";
import { badRequest, conflict, created } from "../utils/http";
import { db } from "../db/intex";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import type id from "zod/v4/locales/id.cjs";

const schema = z.object({
  goal: z.enum(["lose", "maintain", "gain"]),
  gender: z.enum(["male", "female"]),
  birthDate: z.iso.date(),
  weight: z.number(),
  height: z.number(),
  activityLevel: z.number().min(1).max(5),
  account: z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8),
  })
})

export class SignUpController {
  static async handle({ body }: HttpRequest): Promise<HttpResponse> {
    const { success, error, data } = schema.safeParse(body)
    
    if (!success) {
      return badRequest({
        errors: error.issues
      })
    }

    const userAlreadyExists = await db.query.usersTable.findFirst({
      columns: {
        email: true
      },
      where: eq(usersTable.email, data.account.email)
    });

    if (userAlreadyExists) {
      return conflict({
        error: 'This email is already registered.'
      })
    }


    const { account, ...rest } = data

    const [user] = await db.insert(usersTable).values({
      name: account.name,
      email: account.email,
      password: account.password,
      ...rest,
      calories: 0,
      carbohydrates: 0,
      fats: 0,
      proteins: 0,
    }).returning({
      id: usersTable.id,
    })


    return created({
      userId: user.id
    })
  }
}