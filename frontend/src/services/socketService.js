import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isInitialized = false;
  }

  init(token) {
    if (this.isInitialized) return;

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    this.socket = io(apiUrl, {
      auth: {
        token
      },
      withCredentials: true,
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Connexion socket établie');
      this.isInitialized = true;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erreur de connexion socket:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Déconnexion socket:', reason);
      this.isInitialized = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isInitialized = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  emit(event, data) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }

  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }
}

const socketService = new SocketService();
export default socketService;