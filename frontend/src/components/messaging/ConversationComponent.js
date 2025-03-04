import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  PaperAirplaneIcon, 
  PaperClipIcon, 
  PhotoIcon,
  DocumentIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../api/client';
import Button from '../ui/Button';

const ConversationComponent = ({ annonceId, recipientId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [recipient, setRecipient] = useState(null);
  const [annonce, setAnnonce] = useState(null);
  const { id: conversationId } = useParams();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  // Determine which ID to use (either from props or URL params)
  const effectiveAnnonceId = annonceId || (conversationId && conversationId.split('_')[0]);
  const effectiveRecipientId = recipientId || (conversationId && conversationId.split('_')[1]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!effectiveAnnonceId || !effectiveRecipientId) return;

      try {
        setLoading(true);
        const response = await apiClient.get(
          `/messages/conversation/${effectiveAnnonceId}/${effectiveRecipientId}`
        );
        setMessages(response.data.data);
        
        // Mark messages as read
        if (response.data.data.some(msg => !msg.lu && msg.expediteur._id !== user.id)) {
          await apiClient.put(`/messages/mark-read/${effectiveAnnonceId}/${effectiveRecipientId}`);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        toast.error('Erreur lors du chargement des messages');
      } finally {
        setLoading(false);
      }
    };

    const fetchRecipientInfo = async () => {
      if (!effectiveRecipientId) return;

      try {
        const response = await apiClient.get(`/users/profile/${effectiveRecipientId}`);
        setRecipient(response.data.data);
      } catch (err) {
        console.error('Error fetching recipient info:', err);
      }
    };

    const fetchAnnonceInfo = async () => {
      if (!effectiveAnnonceId) return;

      try {
        const response = await apiClient.get(`/annonces/${effectiveAnnonceId}`);
        setAnnonce(response.data.data);
      } catch (err) {
        console.error('Error fetching annonce info:', err);
      }
    };

    fetchMessages();
    fetchRecipientInfo();
    fetchAnnonceInfo();

    // Set up message polling every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [effectiveAnnonceId, effectiveRecipientId, user.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message change
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size (max 5MB per file)
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    
    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} fichier(s) dépassent la taille limite de 5MB`);
    }

    // Add valid files to attachments with preview
    const newAttachments = validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      type: file.type,
      size: file.size
    }));

    setAttachments([...attachments, ...newAttachments]);
  };

  // Remove attachment
  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    
    // Revoke object URL to avoid memory leaks
    if (newAttachments[index].preview) {
      URL.revokeObjectURL(newAttachments[index].preview);
    }
    
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && attachments.length === 0) || !effectiveAnnonceId || !effectiveRecipientId) {
      return;
    }

    try {
      setLoading(true);
      
      // Create form data for sending files if any
      let response;
      
      if (attachments.length > 0) {
        const formData = new FormData();
        formData.append('contenu', newMessage);
        formData.append('destinataire', effectiveRecipientId);
        formData.append('annonce', effectiveAnnonceId);
        
        attachments.forEach(attachment => {
          formData.append('pieceJointes', attachment.file);
        });
        
        response = await apiClient.post('/messages/with-attachments', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await apiClient.post('/messages', {
          contenu: newMessage,
          destinataire: effectiveRecipientId,
          annonce: effectiveAnnonceId
        });
      }
      
      // Add the new message to the list
      setMessages([...messages, response.data.data]);
      setNewMessage('');
      
      // Clear attachments and revoke object URLs
      attachments.forEach(attachment => {
        if (attachment.preview) {
          URL.revokeObjectURL(attachment.preview);
        }
      });
      setAttachments([]);
      
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Get file icon based on type
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return PhotoIcon;
    return DocumentIcon;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${format(date, 'HH:mm')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'dd MMM yyyy à HH:mm', { locale: fr });
    }
  };

  if (!effectiveAnnonceId || !effectiveRecipientId) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Veuillez sélectionner une conversation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
            {recipient && recipient.photo ? (
              <img 
                src={recipient.photo} 
                alt={`${recipient.prenom} ${recipient.nom}`} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-teal-500 text-white font-semibold">
                {recipient && recipient.prenom ? recipient.prenom.charAt(0) : '?'}
              </div>
            )}
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">
              {recipient ? `${recipient.prenom} ${recipient.nom}` : 'Chargement...'}
            </h3>
            {annonce && (
              <p className="text-xs text-gray-500">
                {annonce.titre.length > 40 
                  ? annonce.titre.substring(0, 40) + '...' 
                  : annonce.titre}
              </p>
            )}
          </div>
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const fetchMessages = async () => {
                try {
                  setLoading(true);
                  const response = await apiClient.get(
                    `/messages/conversation/${effectiveAnnonceId}/${effectiveRecipientId}`
                  );
                  setMessages(response.data.data);
                  toast.success('Messages mis à jour');
                } catch (err) {
                  console.error('Error refreshing messages:', err);
                  toast.error('Erreur lors de l\'actualisation des messages');
                } finally {
                  setLoading(false);
                }
              };
              fetchMessages();
            }}
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun message. Démarrez la conversation !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isCurrentUser = message.expediteur._id === user.id;
              
              return (
                <div 
                  key={message._id || index}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'bg-teal-500 text-white' : 'bg-white border border-gray-200'} rounded-lg px-4 py-2 shadow-sm`}>
                    <div className="text-sm">
                      {message.contenu}
                    </div>
                    
                    {message.pieceJointe && (
                      <div className="mt-2 border-t border-gray-200 pt-2">
                        <a 
                          href={message.pieceJointe} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`flex items-center text-xs ${isCurrentUser ? 'text-teal-100 hover:text-white' : 'text-teal-600 hover:text-teal-700'}`}
                        >
                          <DocumentIcon className="h-4 w-4 mr-1" />
                          Pièce jointe
                        </a>
                      </div>
                    )}
                    
                    <div className={`text-xs mt-1 ${isCurrentUser ? 'text-teal-100' : 'text-gray-500'}`}>
                      {formatTimestamp(message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Pièces jointes ({attachments.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => {
              const FileIcon = getFileIcon(attachment.type);
              
              return (
                <div 
                  key={index}
                  className="relative bg-white border border-gray-200 rounded-md p-2 flex items-center"
                >
                  {attachment.preview ? (
                    <div className="h-10 w-10 mr-2 flex-shrink-0">
                      <img 
                        src={attachment.preview}
                        alt={attachment.name}
                        className="h-full w-full object-cover rounded"
                      />
                    </div>
                  ) : (
                    <FileIcon className="h-6 w-6 text-gray-500 mr-2" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {attachment.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => removeAttachment(index)}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex items-end">
          <div className="flex-1 mr-2">
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[80px] resize-none"
              placeholder="Écrivez votre message..."
              value={newMessage}
              onChange={handleMessageChange}
              rows={3}
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <PaperClipIcon className="h-5 w-5" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
                accept="image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              />
            </button>
            <button
              type="submit"
              disabled={(!newMessage.trim() && attachments.length === 0) || loading}
              className={`inline-flex items-center justify-center h-10 px-4 rounded-md bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <PaperAirplaneIcon className="h-5 w-5 mr-1" />
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConversationComponent;