import { notFound } from "next/navigation";

// Any unknown URL renders the localized not-found page inside the [lang] layout
export default function CatchAll() {
  notFound();
}
