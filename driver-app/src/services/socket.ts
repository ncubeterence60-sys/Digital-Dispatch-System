import { io, Socket } from 'socket.io-client'

export const ioSocket: Socket = io('http://localhost:3000', {
  autoConnect: false,
  transports: ['websocket']
})

export const connectSocket = () => {
  ioSocket.connect()
}

export const disconnectSocket = () => {
  ioSocket.disconnect()
}

