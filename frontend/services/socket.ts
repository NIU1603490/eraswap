import { io, Socket } from 'socket.io-client';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/api$/, '');

const socket: Socket = io(API_URL, {
  transports: ['websocket'],
});

export default socket;