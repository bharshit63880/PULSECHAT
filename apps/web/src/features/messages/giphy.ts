import { z } from 'zod';

const gifResultSchema = z.object({
  id: z.string(),
  title: z.string().optional().default('GIF'),
  url: z.string().url().optional().nullable(),
  images: z.object({
    fixed_width: z
      .object({
        url: z.string().url(),
        width: z.string().optional().nullable(),
        height: z.string().optional().nullable()
      })
      .optional()
      .nullable(),
    downsized: z
      .object({
        url: z.string().url()
      })
      .optional()
      .nullable(),
    original: z.object({
      url: z.string().url()
    })
  })
});

const gifEnvelopeSchema = z.object({
  data: z.array(gifResultSchema)
});

export type GifSearchItem = {
  id: string;
  title: string;
  previewUrl: string;
  sourceUrl: string;
  sourcePageUrl: string | null;
  width: number | null;
  height: number | null;
};

const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs';
const apiKey = import.meta.env.VITE_GIPHY_API_KEY?.trim() ?? '';

export const hasGiphyKey = apiKey.length > 0;

const mapGifItem = (item: z.infer<typeof gifResultSchema>): GifSearchItem => ({
  id: item.id,
  title: item.title || 'GIF',
  previewUrl: item.images.fixed_width?.url ?? item.images.original.url,
  sourceUrl: item.images.downsized?.url ?? item.images.original.url,
  sourcePageUrl: item.url ?? null,
  width: item.images.fixed_width?.width ? Number(item.images.fixed_width.width) : null,
  height: item.images.fixed_width?.height ? Number(item.images.fixed_width.height) : null
});

const loadGifs = async (path: string, searchParams: URLSearchParams) => {
  if (!hasGiphyKey) {
    return [] as GifSearchItem[];
  }

  searchParams.set('api_key', apiKey);
  searchParams.set('limit', '18');
  searchParams.set('rating', 'pg-13');

  const response = await fetch(`${GIPHY_BASE_URL}/${path}?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error('GIF search is unavailable right now');
  }

  const payload = gifEnvelopeSchema.parse(await response.json());
  return payload.data.map(mapGifItem);
};

export const giphyService = {
  async trending() {
    return loadGifs('trending', new URLSearchParams());
  },

  async search(query: string) {
    const normalized = query.trim();

    if (!normalized) {
      return giphyService.trending();
    }

    return loadGifs(
      'search',
      new URLSearchParams({
        q: normalized,
        lang: 'en'
      })
    );
  },

  async downloadAsFile(item: GifSearchItem) {
    const response = await fetch(item.sourceUrl);

    if (!response.ok) {
      throw new Error('Unable to fetch the selected GIF');
    }

    const blob = await response.blob();
    return new File([blob], `${item.id}.gif`, {
      type: 'image/gif'
    });
  }
};
