// frontend/src/app/messages/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Messages() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du chargement des conversations');
      }

      const data = await response.json();
      console.log('Conversations chargées:', data);
      setConversations(data);
    } catch (error) {
      console.error('Erreur complète:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversation) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/messages/conversation/${conversation.annonce._id}/${conversation.otherUser._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des messages');
      }

      const data = await response.json();
      setMessages(data);
      setSelectedConversation(conversation);
    } catch (error) {
      setError(error.message);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          destinataire: selectedConversation.otherUser._id,
          annonce: selectedConversation.annonce._id,
          contenu: newMessage
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      const data = await response.json();
      setMessages([...messages, data]);
      setNewMessage('');
      
      // Recharger les conversations pour mettre à jour la liste
      loadConversations();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg min-h-[600px] flex">
        {/* Liste des conversations */}
        <div className="w-1/3 border-r overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Conversations</h2>
          </div>
          <div className="overflow-y-auto h-[calc(600px-4rem)]">
            {conversations.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">
                Aucune conversation
              </div>
            ) : (
              conversations.map((conv, index) => (
                <div
                  key={index}
                  onClick={() => loadMessages(conv)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedConversation?.otherUser._id === conv.otherUser._id
                      ? 'bg-blue-50'
                      : ''
                  }`}
                >
                  <div className="font-semibold">{conv.otherUser.nom}</div>
                  <div className="text-sm text-gray-600 truncate">{conv.annonce.titre}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(conv.messages[0].createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Zone de messages */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b">
                <h3 className="font-bold">{selectedConversation.otherUser.nom}</h3>
                <div className="text-sm text-gray-600">
                  {selectedConversation.annonce.titre}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.expediteur._id === selectedConversation.otherUser._id
                        ? 'justify-start'
                        : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] break-words ${
                        message.expediteur._id === selectedConversation.otherUser._id
                          ? 'bg-gray-100'
                          : 'bg-blue-100'
                      } rounded-lg p-3`}
                    >
                      <div>{message.contenu}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border rounded-lg p-2"
                    placeholder="Écrivez votre message..."
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Sélectionnez une conversation
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}