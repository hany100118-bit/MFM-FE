// 편지 API (홈·수신함·보관함·편지 쓰기·상세가 함께 쓴다)
import { api } from '../../shared/api';

export const lettersApi = {
  /** box: sealed | opened | archived, from: self | friend | anyone | reply, 보관함만 q·sort */
  listReceived: ({ box, from, q, sort, limit = 20, offset = 0 }) => api.get('/letters/received', { query: { box, from, q, sort, limit, offset } }),
  listSent: ({ limit = 20, offset = 0 } = {}) => api.get('/letters/sent', { query: { limit, offset } }),
  get: (id) => api.get(`/letters/${id}`).then((d) => d.letter),
  create: (body) => api.post('/letters', body).then((d) => d.letter),
  update: (id, body) => api.patch(`/letters/${id}`, body).then((d) => d.letter),
  remove: (id) => api.del(`/letters/${id}`),
  reply: (id, body) => api.post(`/letters/${id}/reply`, body).then((d) => d.letter),
  setArchived: (id, archived) => api.patch(`/letters/${id}/archive`, { archived }),
  removeReceived: (id) => api.del(`/letters/${id}/received`),
  lookupUser: (handle) => api.get('/users/lookup', { query: { handle } }),
};
