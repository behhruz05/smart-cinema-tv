import { Reel } from '../../service/reel.service';

const STREAM_HOST = 'https://stream.alloplay.uz';

function isAbsoluteUrl(value: string) {
  return /^(https?:\/\/|rtmp:\/\/|file:\/\/)/i.test(value);
}

function cleanPath(value: string) {
  const trimmed = value.trim();
  const noQuery = trimmed.split('?')[0];
  const noLeading = noQuery.replace(/^\/+/, '');
  return noLeading.replace(/^vod\/+/i, '').trim();
}

function toVodCandidates(path: string) {
  const normalized = cleanPath(path);
  if (!normalized) return [];

  const looksLikeManifest = /\.m3u8(\?|$)/i.test(normalized);
  if (looksLikeManifest) {
    return [`${STREAM_HOST}/vod/${normalized}`];
  }

  return [
    `${STREAM_HOST}/vod/${normalized}/master.m3u8`,
    `${STREAM_HOST}/vod/${normalized}`,
  ];
}

function pushCandidate(target: string[], value?: string) {
  if (!value) return;
  const trimmed = value.trim();
  if (!trimmed) return;

  if (isAbsoluteUrl(trimmed)) {
    target.push(trimmed);
    return;
  }

  target.push(...toVodCandidates(trimmed));
}

export function resolveReelPlaybackCandidates(reel: Reel): string[] {
  const candidates: string[] = [];

  pushCandidate(candidates, reel.stream_url);
  pushCandidate(candidates, reel.m3u8_url);
  pushCandidate(candidates, reel.video_url);
  pushCandidate(candidates, reel.flussonic_vod_path);
  pushCandidate(candidates, reel.video_path);

  return [...new Set(candidates)];
}
