import { eq } from "drizzle-orm";
import { db } from "../db";
import { mealsTable } from "../db/schema";

export class ProcessMeal {
  static async proccess({ fileKey }: { fileKey: string }) {
    const meal = await db.query.mealsTable.findFirst({
      where: eq(mealsTable.inputFileKey, fileKey),
    })

    if (!meal) {
      throw new Error(`Meal not found`);
    }

    if (meal.status === 'failed' || meal.status === 'success') {
      return
    }

    await db
      .update(mealsTable)
      .set({ status: 'processing' })
      .where(eq(mealsTable.id, meal.id));

    try {
      // CHAMAR A IA...

      await db
        .update(mealsTable)
        .set({ 
          status: 'success',
          name: 'Café da Manhã',
          icon: '🍞',
          foods: [
            {
              name: 'Pão',
              quantity: '2 fatias',
              calories: 150,
              proteins: 5,
              carbohydrates: 30,
              fats: 2,
            }
          ]
        })
        .where(eq(mealsTable.id, meal.id));
    } catch  {
      await db
        .update(mealsTable)
        .set({ 
          status: 'failed'
        })
        .where(eq(mealsTable.id, meal.id));
    }
  }
}