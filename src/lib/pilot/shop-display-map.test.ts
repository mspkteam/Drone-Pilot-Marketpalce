import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatShopPrice, shopUnlockLabel } from "./shop-display-map";

describe("shop display map", () => {
  it("formats the A-6 lock badge from live tier names", () => {
    assert.equal(shopUnlockLabel("A6_CAPTAIN"), "UNLOCKED AT A-6 CAPTAIN");
  });

  it("formats whole-dollar prices without cents", () => {
    assert.equal(formatShopPrice(45), "$45");
    assert.equal(formatShopPrice(99.99), "$99.99");
  });
});
