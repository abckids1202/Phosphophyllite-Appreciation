// Optional REST adapter for the static PHOS client.
// Keep the anon key in a public client config only; never place a service key here.

const cleanUrl = value => String(value || '').replace(/\/$/, '');

export function createPhosSupabaseAdapter({ url, anonKey, accessToken, userId } = {}) {
  const base = cleanUrl(url);
  if (!base || !anonKey) throw new Error('Supabase URL and anon key are required.');
  const headers = { apikey: anonKey, Authorization: `Bearer ${accessToken || anonKey}`, 'Content-Type': 'application/json' };
  async function request(path, options = {}) {
    const response = await fetch(`${base}/rest/v1/${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
    if (!response.ok) throw new Error(`Supabase request failed (${response.status})`);
    return response.status === 204 ? null : response.json();
  }
  return {
    listApprovedAnnotations({ sourceType, sourceId, lens } = {}) {
      const params = new URLSearchParams({ select: '*', status: 'eq.approved', order: 'created_at.desc' });
      if (sourceType) params.set('source_type', `eq.${sourceType}`);
      if (sourceId) params.set('source_id', `eq.${sourceId}`);
      if (lens && lens !== 'all') params.set('lens', `eq.${lens}`);
      return request(`annotations?${params}`);
    },
    submitAnnotation(annotation) {
      return request('annotations', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ ...annotation, user_id: annotation.user_id || userId, status: 'pending' }) });
    },
    setReaction(annotationId, kind) {
      return request('annotation_reactions', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify({ annotation_id: annotationId, user_id: userId, kind }) });
    },
    removeReaction(annotationId) {
      return request(`annotation_reactions?annotation_id=eq.${encodeURIComponent(annotationId)}`, { method: 'DELETE' });
    },
  };
}
