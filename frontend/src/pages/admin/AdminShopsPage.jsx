import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  hideShopProducts,
} from "../../services/moderationService";
import { fetchProductsByShopId } from "../../services/productService";
import {
  listShopsForAdmin,
  setShopSuspended,
  setShopVerified,
} from "../../services/shopsService";

function AdminShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setShops(await listShopsForAdmin());
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
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e?.message || "Action failed.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Shops</h1>
      <p className="mt-1 text-sm text-slate-600">
        Approve verification, suspend sellers, or disable all listings for a shop.
      </p>
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
                <div>
                  <p className="font-bold">{shop.shopName}</p>
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
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionBtn
                    disabled={busyId === shop.id}
                    onClick={() =>
                      run(shop.id, () => setShopVerified(shop.id, !shop.isVerified))
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
                        const products = await fetchProductsByShopId(shop.id, 80, {
                          includeHidden: true,
                        });
                        const visible = products.filter((p) => !p.hidden);
                        if (visible.length) {
                          await hideShopProducts(shop.id, visible);
                        }
                      })
                    }
                  >
                    Disable listings
                  </ActionBtn>
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
