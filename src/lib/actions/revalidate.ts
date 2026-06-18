'use server';

export async function triggerWebsiteRevalidation(tag: 'hero' | 'gallery' | 'events' | 'team') {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(`${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REVALIDATION_TOKEN}`,
      },
      body: JSON.stringify({ tag }),
      cache: 'no-store',
      signal: controller.signal,
    });
    
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`Revalidation failed with status code: ${res.status}`);
    }
  } catch (error) {
    console.error('Failed to trigger website revalidation:', error);
  }
}
