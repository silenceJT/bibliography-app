import { test } from "node:test";
import assert from "node:assert/strict";
import { permissionStatus } from "./permission-check.ts";
import { ROLE_PERMISSIONS } from "../types/user.ts";

const check = (user, perm) => permissionStatus(user, perm, ROLE_PERMISSIONS);

test("standard users can read but not create, edit or delete", () => {
  const u = { role: "standard", is_active: true };
  assert.equal(check(u, "canView"), 200);
  assert.equal(check(u, "canCreate"), 403);
  assert.equal(check(u, "canUpdate"), 403);
  assert.equal(check(u, "canDelete"), 403);
});

test("admins and super admins can write", () => {
  for (const role of ["admin", "super_admin"]) {
    for (const perm of ["canView", "canCreate", "canUpdate", "canDelete"]) {
      assert.equal(check({ role, is_active: true }, perm), 200, `${role} ${perm}`);
    }
  }
});

test("no account, deactivated account or unknown role is refused", () => {
  assert.equal(check(null, "canView"), 401);
  assert.equal(check({ role: "admin", is_active: false }, "canDelete"), 401);
  assert.equal(check({ role: "hacker", is_active: true }, "canView"), 403);
  assert.equal(check({ is_active: true }, "canView"), 403);
});
