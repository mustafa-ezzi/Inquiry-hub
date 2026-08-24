import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ANTARIA_STEELS_SHOP_ID,
  associateProductsWithShop,
  backfillProductVendorNames,
  linkShopOwner,
} from "../../services/adminCatalogService";
import { listUsers } from "../../services/adminUsersService";
import { hideShopProducts } from "../../services/moderationService";
import { fetchProductsByShopId } from "../../services/productService";
import {
  listShopsForAdmin,
  setShopSuspended,
  setShopVerified,
} from "../../services/shopsService";

function AdminShopsPage() {
  const [shops, setShops] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [ownerDraft, setOwnerDraft] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [shopRows, userRows] = await Promise.all([
        listShopsForAdmin(),
        listUsers().catch(() => []),
      ]);
      setShops(shopRows);
      setUsers(userRows);
      const drafts = {};
      for (const s of shopRows) {
        drafts[s.id] = s.ownerUid || "";
      }
      setOwnerDraft(drafts);
    } catch (e) {
      setError(e?.message || "Could not load shops.");
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (shopId, fn) => {
    setBusyId(shopId);
    setError("");
    setMessage("");
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e?.message || "Action failed.");
    } finally {
      setBusyId("");
    }
  };

  const ownerLabel = (uid) => {
    if (!uid) return "No owner linked";
    const u = users.find((x) => x.id === uid || x.uid === uid);
    if (!u) return uid;
    return `${u.displayName || u.email || "User"} (${uid.slice(0, 6)}…)`;
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Shops</h1>
      <p className="mt-1 text-sm text-slate-600">
        Approve verification, suspend sellers, link owners, and repair product
        associations.
      </p>
      {message ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      <ul className="mt-6 space-y-3">
        {loading ? (
          <li className="text-sm text-slate-500">Loading…</li>
        ) : shops.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
            No shops yet.
          </li>
        ) : (
          shops.map((shop) => (
            <li
              key={shop.id}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {shop.shopName}
                    {shop.id === ANTARIA_STEELS_SHOP_ID ? (
                      <span className="ml-2 text-xs font-semibold text-[#0F6B36]">
                        (Antaria)
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-slate-600">{shop.location}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {shop.isVerified ? "Verified" : "Unverified"}
                    {shop.suspended ? " · Suspended" : ""}
                    {shop.repliesQuickly ? " · Replies quickly" : ""}
                    {" · "}
                    <Link
                      to={`/shop/${encodeURIComponent(shop.id)}`}
                      className="font-semibold text-[#0F6B36] hover:underline"
                    >
                      Public page
                    </Link>
                  </p>
                  <p className="mt-2 text-xs text-slate-600">
                    Owner: {ownerLabel(shop.ownerUid)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <select
                      value={ownerDraft[shop.id] || ""}
                      onChange={(e) =>
                        setOwnerDraft((d) => ({
                          ...d,
                          [shop.id]: e.target.value,
                        }))
                      }
                      className="min-h-[36px] max-w-[16rem] rounded-lg border border-slate-200 px-2 text-xs"
                    >
                      <option value="">Select user…</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.displayName || u.email || u.id}
                        </option>
                      ))}
                    </select>
                    <ActionBtn
                      disabled={busyId === shop.id || !ownerDraft[shop.id]}
                      onClick={() =>
                        run(shop.id, async () => {
                          await linkShopOwner(shop.id, ownerDraft[shop.id]);
                          setMessage(
                            `Linked owner on ${shop.shopName}.`
                          );
                        })
                      }
                    >
                      Link owner
                    </ActionBtn>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionBtn
                    disabled={busyId === shop.id}
                    onClick={() =>
                      run(shop.id, () =>
                        setShopVerified(shop.id, !shop.isVerified)
                      )
                    }
                  >
                    {shop.isVerified ? "Unverify" : "Approve"}
                  </ActionBtn>
                  <ActionBtn
                    disabled={busyId === shop.id}
                    danger={!!shop.suspended}
                    onClick={() =>
                      run(shop.id, () =>
                        setShopSuspended(
                          shop.id,
                          !shop.suspended,
                          shop.suspended ? "" : "Admin suspension"
                        )
                      )
                    }
                  >
                    {shop.suspended ? "Unsuspend" : "Suspend"}
                  </ActionBtn>
                  <ActionBtn
                    disabled={busyId === shop.id}
                    onClick={() =>
                      run(shop.id, async () => {
                        const products = await fetchProductsByShopId(
                          shop.id,
                          80,
                          { includeHidden: true }
                        );
                        const visible = products.filter((p) => !p.hidden);
                        if (visible.length) {
                          await hideShopProducts(shop.id, visible);
                        }
                      })
                    }
                  >
                    Disable listings
                  </ActionBtn>
                  <ActionBtn
                    disabled={busyId === shop.id}
                    onClick={() =>
                      run(shop.id, async () => {
                        const r = await backfillProductVendorNames(shop.id);
                        setMessage(
                          `Fixed vendor labels on ${r.updated} products for ${r.shopName}.`
                        );
                      })
                    }
                  >
                    Fix product vendors
                  </ActionBtn>
                  {shop.id === ANTARIA_STEELS_SHOP_ID ? (
                    <ActionBtn
                      disabled={busyId === shop.id}
                      onClick={() =>
                        run(shop.id, async () => {
                          const r = await associateProductsWithShop(shop.id, {
                            onlyMissingShop: false,
                          });
                          setMessage(
                            `Associated ${r.updated} products with ${r.shopName}.`
                          );
                        })
                      }
                    >
                      Associate all products
                    </ActionBtn>
                  ) : null}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function ActionBtn({ children, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50",
        danger
          ? "border-rose-200 text-rose-700 hover:bg-rose-50"
          : "border-slate-200 text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default AdminShopsPage;
