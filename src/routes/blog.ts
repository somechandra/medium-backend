import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { createBlogInput, updateBlogInput } from "../zod";

// Create the main Hono app
export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("authorization") || "";
  try {
    const user = await verify(authHeader, c.env?.JWT_SECRET);
    if (!user) {
      c.status(403);
      return c.json({
        message: "You are not logged in",
      });
    }
    c.set("userId", user.id);
    await next();
  } catch (error) {
    c.status(403);
    return c.json({
      message: "You are not logged in",
    });
  }
});

// blogRouter.use("/*", async (c, next) => {
//   // extract the user id
//   // pass it down to the route handler
//   // get the header
//   // verify the header
//   // if the header is correct, we can proceed
//   // if npt, we return the user a 403 status code
//   const header = c.req.header("authorization") || "";
//   if (!header) {
//     c.status(401);
//     return c.json({ error: "unauthorized" });
//   }
//   // Bearer token => ["Bearer", "token"]
//   const token = header.split(" ")[1];
//   const response = await verify(header, c.env.JWT_SECRET);
//   if (response.id) {
//     // await next();
//     next();
//   } else {
//     c.status(403);
//     return c.json({ error: "unauthorized" });
//   }
// });

// blogRouter.get("/:id", (c) => {
//   const id = c.req.param("id");
//   console.log(id);
//   return c.text("get blog route");
// });

// TODO: add pagination
blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blogs = await prisma.post.findMany();
    return c.json({ blogs });
  } catch (error) {
    c.status(411);
    return c.json({ error: "Error while fetching blog posts" });
  }
});

blogRouter.get("/:id", async (c) => {
  const id = await c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.post.findFirst({
      where: {
        id: id,
      },
    });
    return c.json({ blog });
  } catch (error) {
    c.status(411);
    return c.json({ error: "Error while fetching blog post" });
  }
  //   return c.text("signin route");
});

blogRouter.post("/", async (c) => {
  const body = await c.req.json();
  const { success } = createBlogInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ message: "Inputs are not correct!" });
  }
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const blog = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: userId,
    },
  });

  //   return c.text("signin route");
  return c.json({ id: blog.id });
});

blogRouter.put("/", async (c) => {
  const body = await c.req.json();
  const { success } = updateBlogInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ message: "Inputs are not correct!" });
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const blog = await prisma.post.update({
    where: {
      id: body.id,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });

  //   return c.text("signin route");
  return c.json({ id: blog.id });
});
