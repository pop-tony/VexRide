import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

export const socket = io(API_BASE_URL, { transports: ['websocket'] });

export function joinUser(userId) {
  socket.emit('joinUser', userId);
}

export function joinChatRoom(matchId) {
  socket.emit('joinChat', { matchId });
}

export function sendChatMessage(payload) {
  socket.emit('sendChatMessage', payload);
}

export function markMessageSeen(payload) {
  socket.emit('messageSeen', payload);
}

export function sendTypingStart(matchId) {
  socket.emit('typing:start', { matchId });
}

export function sendTypingStop(matchId) {
  socket.emit('typing:stop', { matchId });
}

export function onSocket(event, handler) {
  socket.on(event, handler);
  return () => socket.off(event, handler);
}

export function onSocketConnect(handler) {
  socket.on('connect', handler);
  return () => socket.off('connect', handler);
}
