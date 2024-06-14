import { test, expect } from "./fixtures";

test("page one should successfully call backend and display reply", async ({
  pageOne,
  page,
}) => {
  await expect(page.getByText("pong")).toBeVisible();
});

test("page one should succesfully check health and display status", async ({
  pageOne,
  page,
}) => {
  await expect(page.getByText("OK")).toBeVisible();
});
