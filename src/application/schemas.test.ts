import { describe, expect, it } from "vitest";
import { usernameSchema } from "./schemas";

describe("GitHub username validation", () => {
  it.each(["octocat", "javad-hasani", "dev123"])("accepts %s", (value) => expect(usernameSchema.safeParse(value).success).toBe(true));
  it.each(["-invalid", "invalid-", "two--dashes", "space user", ""])("rejects %s", (value) => expect(usernameSchema.safeParse(value).success).toBe(false));
});
