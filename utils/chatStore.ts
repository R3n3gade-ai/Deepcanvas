import { create } from 'zustand';
import { firebaseApp } from 'app';
import { collection, doc, getDoc, getDocs, setDoc, query, orderBy, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import brain from '../brain';

// Define message types
export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  content: string;
  timestamp?: Timestamp | null;
}

export interface Conversation {
  id: string;
  title: string;
  lastUpdated: Timestamp | null;
  messages: ChatMessage[];
}

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  
  // Actions
  loadConversations: () => Promise<void>;
  createNewConversation: () => Promise<string>;
  loadConversation: (conversationId: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  setCurrentConversation: (conversationId: string | null) => void;
}

// Create the store
export const useChatStore = create<ChatState>((set, get) => {
  // Initialize Firestore
  const db = getFirestore(firebaseApp);
  const conversationsCollection = collection(db, 'conversations');
  
  return {
    conversations: [],
    currentConversationId: null,
    isLoading: false,
    isSending: false,
    error: null,
    
    // Load all conversations for the current user
    loadConversations: async () => {
      set({ isLoading: true, error: null });
      try {
        const q = query(conversationsCollection, orderBy('lastUpdated', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const conversations: Conversation[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Conversation, 'id' | 'messages'>;
          conversations.push({
            id: doc.id,
            title: data.title || 'New Conversation',
            lastUpdated: data.lastUpdated,
            messages: []
          });
        });
        
        set({ conversations, isLoading: false });
      } catch (error) {
        console.error('Error loading conversations:', error);
        set({ error: 'Failed to load conversations', isLoading: false });
      }
    },
    
    // Create a new conversation
    createNewConversation: async () => {
      set({ isLoading: true, error: null });
      try {
        const newConversation = {
          title: 'New Conversation',
          lastUpdated: serverTimestamp(),
          messages: []
        };
        
        const docRef = await addDoc(conversationsCollection, newConversation);
        const conversationId = docRef.id;
        
        // Add the new conversation to the state
        const conversation: Conversation = {
          id: conversationId,
          title: 'New Conversation',
          lastUpdated: null,
          messages: []
        };
        
        set(state => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: conversationId,
          isLoading: false
        }));
        
        return conversationId;
      } catch (error) {
        console.error('Error creating conversation:', error);
        set({ error: 'Failed to create new conversation', isLoading: false });
        return '';
      }
    },
    
    // Load a specific conversation with messages
    loadConversation: async (conversationId: string) => {
      set({ isLoading: true, error: null });
      try {
        // Get conversation document
        const conversationRef = doc(db, 'conversations', conversationId);
        const conversationDoc = await getDoc(conversationRef);
        
        if (!conversationDoc.exists()) {
          throw new Error('Conversation not found');
        }
        
        const conversationData = conversationDoc.data() as Omit<Conversation, 'id' | 'messages'>;
        
        // Get messages for this conversation
        const messagesCollection = collection(db, 'conversations', conversationId, 'messages');
        const q = query(messagesCollection, orderBy('timestamp', 'asc'));
        const messagesSnapshot = await getDocs(q);
        
        const messages: ChatMessage[] = [];
        messagesSnapshot.forEach((doc) => {
          const data = doc.data() as Omit<ChatMessage, 'id'>;
          messages.push({
            id: doc.id,
            role: data.role,
            content: data.content,
            timestamp: data.timestamp
          });
        });
        
        // Update the conversation in the state
        set(state => {
          const updatedConversations = state.conversations.map(conv => 
            conv.id === conversationId 
              ? {
                  ...conv,
                  title: conversationData.title || 'New Conversation',
                  lastUpdated: conversationData.lastUpdated,
                  messages
                }
              : conv
          );
          
          return {
            conversations: updatedConversations,
            currentConversationId: conversationId,
            isLoading: false
          };
        });
      } catch (error) {
        console.error('Error loading conversation:', error);
        set({ error: 'Failed to load conversation', isLoading: false });
      }
    },
    
    // Send a message and get a response from the AI
    sendMessage: async (message: string) => {
      const { currentConversationId } = get();
      if (!currentConversationId) {
        set({ error: 'No active conversation' });
        return;
      }
      
      set({ isSending: true, error: null });
      try {
        // Add the user message to Firestore
        const conversationRef = doc(db, 'conversations', currentConversationId);
        const messagesCollection = collection(conversationRef, 'messages');
        
        const userMessage: Omit<ChatMessage, 'id'> = {
          role: 'user',
          content: message,
          timestamp: serverTimestamp()
        };
        
        await addDoc(messagesCollection, userMessage);
        
        // Update the UI immediately with the user message
        set(state => {
          const updatedConversations = state.conversations.map(conv => {
            if (conv.id === currentConversationId) {
              return {
                ...conv,
                messages: [...conv.messages, { ...userMessage, timestamp: null }]
              };
            }
            return conv;
          });
          
          return { conversations: updatedConversations };
        });
        
        // Get all messages for the API request
        const currentConversation = get().conversations.find(
          conv => conv.id === currentConversationId
        );
        
        if (!currentConversation) {
          throw new Error('Conversation not found');
        }
        
        // Call the AI API
        const response = await brain.chat_with_gemini({
          messages: currentConversation.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: 0.7,
          max_output_tokens: 800
        });
        
        const responseData = await response.json();
        
        // Add the AI response to Firestore
        const modelMessage: Omit<ChatMessage, 'id'> = {
          role: 'model',
          content: responseData.response,
          timestamp: serverTimestamp()
        };
        
        await addDoc(messagesCollection, modelMessage);
        
        // Update the conversation's last updated timestamp
        await setDoc(conversationRef, { lastUpdated: serverTimestamp() }, { merge: true });
        
        // Update the UI with the AI response
        set(state => {
          const updatedConversations = state.conversations.map(conv => {
            if (conv.id === currentConversationId) {
              return {
                ...conv,
                lastUpdated: null, // Will be updated when we reload
                messages: [...conv.messages, { ...modelMessage, timestamp: null }]
              };
            }
            return conv;
          });
          
          return { 
            conversations: updatedConversations,
            isSending: false 
          };
        });
      } catch (error) {
        console.error('Error sending message:', error);
        set({ 
          error: 'Failed to send message or receive response',
          isSending: false 
        });
      }
    },
    
    // Set the current conversation
    setCurrentConversation: (conversationId: string | null) => {
      set({ currentConversationId: conversationId });
    }
  };
});
