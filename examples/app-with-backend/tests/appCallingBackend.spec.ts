import { test, expect } from "./fixtures";

test("page one should successfully call backend and display reply", async ({
  pageOne,
  page,
}) => {
  await pageOne.goto();
});

test("page one should succesfully check health and display status", async ({
  pageOne,
  page,
}) => {
  await pageOne.goto();
});
