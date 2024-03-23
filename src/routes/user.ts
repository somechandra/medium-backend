import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { signInInput, signUpInput } from "../zod";

// Create the main Hono app
export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const { success } = signUpInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ message: "Inputs are not correct!" });
  }
  //   const prisma = new PrismaClient({
  //     datasourceUrl: env.DATABASE_URL,
  //   }).$extends(withAccelerate());
  //   return c.text("signup route");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      },
    });
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt });
  } catch (e) {
    c.status(403);
    return c.json({ error: "error while signing up" });
  }
});

userRouter.post("/signin", async (c) => {
  //   return c.text("signin route");
  const body = await c.req.json();
  const { success } = signInInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ message: "Inputs are not correct!" });
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password,
    },
  });

  if (!user) {
    c.status(403);
    return c.json({ error: "user not found" });
  }

  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
  return c.json({ jwt });
});
