import HomeClient from '@/components/HomeClient';
import { loadBookmarks } from '@/lib/data/loaders';

export const dynamic = 'force-static';

export default async function Page() {
  const data = await loadBookmarks();

  return <HomeClient data={data} />;
}
