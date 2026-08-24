import { useCallback, useEffect, useState } from "react";
import { listUsers, setUserRole } from "../../services/adminUsersService";
import { ROLES } from "../../lib/roles";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await listUsers());
    } catch (e) {
      setError(e?.message || "Could not load users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const changeRole = async (user, role) => {
    if (role === ROLES.ADMIN) {
      const ok = window.confirm(
        `Promote ${user.displayName || user.email || user.uid} to admin?`
      );
      if (!ok) return;
    }
    setBusyId(user.id);
    setError("");
    try {
      await setUserRole(user.id, role);
      await load();
    } catch (e) {
      setError(e?.message || "Could not update role.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Users</h1>
      <p className="mt-1 text-sm text-slate-600">
        Change roles. Admin promotion requires confirmation.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      <ul className="mt-6 space-y-2">
        {loading ? (
          <li className="text-sm text-slate-500">Loading…</li>
        ) : users.length === 0 ? (
          <li className="text-sm text-slate-500">No users found.</li>
        ) : (
          users.map((u) => (
            <li
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <div>
                <p className="font-bold">{u.displayName || "—"}</p>
                <p className="text-sm text-slate-600">
                  {u.email || u.uid}
                  {u.phone ? ` · ${u.phone}` : ""}
                </p>
                <p className="text-xs text-slate-400">
                  Role: {u.role}
                  {u.shopIds?.length ? ` · shops ${u.shopIds.join(", ")}` : ""}
                </p>
              </div>
              <select
                value={u.role}
                disabled={busyId === u.id}
                onChange={(e) => changeRole(u, e.target.value)}
                className="min-h-[40px] rounded-xl border border-slate-200 px-3 text-sm"
              >
                <option value={ROLES.BUYER}>buyer</option>
                <option value={ROLES.VENDOR}>vendor</option>
                <option value={ROLES.ADMIN}>admin</option>
              </select>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default AdminUsersPage;
