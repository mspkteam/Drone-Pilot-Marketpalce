import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getBlobStoreAccess } from "@/lib/storage/private-asset";

describe("private asset blob access mode", () => {
  it("defaults to public so existing public stores work", () => {
    const prev = process.env.BLOB_ACCESS_MODE;
    try {
      delete process.env.BLOB_ACCESS_MODE;
      assert.equal(getBlobStoreAccess(), "public");

      process.env.BLOB_ACCESS_MODE = "public";
      assert.equal(getBlobStoreAccess(), "public");

      process.env.BLOB_ACCESS_MODE = "PRIVATE";
      assert.equal(getBlobStoreAccess(), "private");
    } finally {
      if (prev === undefined) delete process.env.BLOB_ACCESS_MODE;
      else process.env.BLOB_ACCESS_MODE = prev;
    }
  });
});
