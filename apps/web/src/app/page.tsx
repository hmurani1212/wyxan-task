import { BrowserApp } from '@/components/BrowserApp';
import { getPeople, getSites } from '@/lib/server';

// Who is browsing is decided on the client from per-person saved state, so the
// shell itself is not cached per visitor.
export const dynamic = 'force-dynamic';

export default async function Page() {
  const [people, sites] = await Promise.all([getPeople(), getSites()]);
  return <BrowserApp initialPeople={people} initialSites={sites} />;
}
