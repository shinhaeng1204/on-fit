// app/auth/confirm/page.tsx

import { Suspense } from "react";
import ConfirmPageClient from "./components/ConfirmPageClient";

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmPageClient />
    </Suspense>
  );
}
