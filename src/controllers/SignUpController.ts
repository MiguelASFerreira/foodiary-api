import { z } from "zod";
import { hash } from "bcryptjs"
import type { HttpRequest, HttpResponse } from "../types/Http";
import { badRequest, conflict, created } from "../utils/http";
import { db } from "../db/intex";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { signAccessTokenFor } from "../lib/jwt";
import { calculateGoals } from "../lib/caculateGoals";

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
    const goals = calculateGoals({
      activityLevel: rest.activityLevel,
      birthDate: new Date(rest.birthDate),
      gender: rest.gender,
      goal: rest.goal,
      height: rest.height,
      weight: rest.weight,
    });

    const hashedPassword = await hash(data.account.password, 8)

    const [user] = await db.insert(usersTable).values({
      name: account.name,
      email: account.email,
      password: hashedPassword,
      ...rest,
      ...goals
    }).returning({
      id: usersTable.id,
    })

    const accessToken = signAccessTokenFor(user.id);

    return created({
      accessToken
    })
  }
}