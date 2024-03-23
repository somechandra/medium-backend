import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";

// Create the main Hono app
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

// app.use("/api/v1/blog/*", async (c, next) => {
//   // get the header
//   // verify the header
//   // if the header is correct, we can proceed
//   // if npt, we return the user a 403 status code
//   const header = c.req.header("authorization") || "";
//   if (!header) {
// 		c.status(401);
// 		return c.json({ error: "unauthorized" });
// 	}
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

// app.post("/api/v1/signup", async (c) => {
//   //   const prisma = new PrismaClient({
//   //     datasourceUrl: env.DATABASE_URL,
//   //   }).$extends(withAccelerate());
//   //   return c.text("signup route");
//   const prisma = new PrismaClient({
//     datasourceUrl: c.env?.DATABASE_URL,
//   }).$extends(withAccelerate());

//   const body = await c.req.json();
//   try {
//     const user = await prisma.user.create({
//       data: {
//         email: body.email,
//         password: body.password,
//       },
//     });
//     const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
//     return c.json({ jwt });
//   } catch (e) {
//     c.status(403);
//     return c.json({ error: "error while signing up" });
//   }
// });

// app.post("/api/v1/signin", async (c) => {
//   //   return c.text("signin route");
//   const prisma = new PrismaClient({
//     datasourceUrl: c.env?.DATABASE_URL,
//   }).$extends(withAccelerate());

//   const body = await c.req.json();
//   const user = await prisma.user.findUnique({
//     where: {
//       email: body.email,
//       password: body.password,
//     },
//   });

//   if (!user) {
//     c.status(403);
//     return c.json({ error: "user not found" });
//   }

//   const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
//   return c.json({ jwt });
// });

// app.get("/api/v1/blog/:id", (c) => {
//   const id = c.req.param("id");
//   console.log(id);
//   return c.text("get blog route");
// });

// app.post("/api/v1/blog", (c) => {
//   return c.text("signin route");
// });

// app.put("/api/v1/blog", (c) => {
//   return c.text("signin route");
// });

export default app;

// npx wrangler login
// npx wrangler whoami
// npm run deploy
// ⛅️ wrangler 3.29.0
// -------------------
// ✔ Would you like to help improve Wrangler by sending usage metrics to Cloudflare? … yes
// Your choice has been saved in the following file: ../../../../../Library/Preferences/.wrangler/metrics.json.

//   You can override the user level setting for a project in `wrangler.toml`:

//    - to disable sending metrics for a project: `send_metrics = false`
//    - to enable sending metrics for a project: `send_metrics = true`
// Your worker has access to the following bindings:
// - Vars:
//   - DATABASE_URL: "prisma://accelerate.prisma-data.net/?..."
