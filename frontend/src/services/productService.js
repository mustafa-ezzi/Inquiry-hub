import {
  collection,
  getDocs,
  limit,
  query,
  startAfter,
  orderBy
} from "firebase/firestore";
import { db } from "../lib/firebase";

export async function fetchProducts(lastDoc = null) {
  let q = query(
    collection(db, "products"),
    orderBy("created_at", "desc"),
    limit(20)
  );

  if (lastDoc) {
    q = query(
      collection(db, "products"),
      orderBy("created_at", "desc"),
      startAfter(lastDoc),
      limit(20)
    );
  }

  

  const snapshot = await getDocs(q);

  return {
    products: snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
  };
}