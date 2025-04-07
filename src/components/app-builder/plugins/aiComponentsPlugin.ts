/**
 * GrapesJS plugin for AI-powered components
 */
export const aiComponentsPlugin = (editor: any) => {
  // Add AI components category
  editor.BlockManager.addCategory({ id: 'ai-components', label: 'AI Components' });

  // AI Text Generator
  editor.BlockManager.add('ai-text-generator', {
    label: 'AI Text Generator',
    category: 'ai-components',
    content: {
      type: 'ai-text-generator',
      content: '<div class="ai-text-generator">Generate text with AI</div>',
      style: {
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: '#f8f9fa'
      }
    }
  });

  // AI Image Generator
  editor.BlockManager.add('ai-image-generator', {
    label: 'AI Image Generator',
    category: 'ai-components',
    content: {
      type: 'ai-image-generator',
      content: '<div class="ai-image-generator">Generate images with AI</div>',
      style: {
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: '#f8f9fa'
      }
    }
  });

  // AI Chatbot
  editor.BlockManager.add('ai-chatbot', {
    label: 'AI Chatbot',
    category: 'ai-components',
    content: {
      type: 'ai-chatbot',
      content: `
        <div class="ai-chatbot">
          <div class="chat-header">AI Chatbot</div>
          <div class="chat-messages">
            <div class="message bot">Hello! How can I help you today?</div>
          </div>
          <div class="chat-input">
            <input type="text" placeholder="Type your message...">
            <button>Send</button>
          </div>
        </div>
      `,
      style: {
        '.ai-chatbot': {
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
          width: '300px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        '.chat-header': {
          backgroundColor: '#4285f4',
          color: 'white',
          padding: '10px 15px',
          fontWeight: 'bold'
        },
        '.chat-messages': {
          height: '200px',
          overflowY: 'auto',
          padding: '10px',
          backgroundColor: '#f8f9fa'
        },
        '.message': {
          margin: '5px 0',
          padding: '8px 12px',
          borderRadius: '18px',
          maxWidth: '80%',
          wordWrap: 'break-word'
        },
        '.bot': {
          backgroundColor: '#e9e9eb',
          alignSelf: 'flex-start'
        },
        '.user': {
          backgroundColor: '#4285f4',
          color: 'white',
          alignSelf: 'flex-end',
          marginLeft: 'auto'
        },
        '.chat-input': {
          display: 'flex',
          padding: '10px',
          borderTop: '1px solid #ddd',
          backgroundColor: 'white'
        },
        'input': {
          flex: '1',
          border: '1px solid #ddd',
          borderRadius: '20px',
          padding: '8px 15px',
          marginRight: '10px'
        },
        'button': {
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          padding: '8px 15px',
          cursor: 'pointer'
        }
      }
    }
  });

  // AI Form Assistant
  editor.BlockManager.add('ai-form-assistant', {
    label: 'AI Form Assistant',
    category: 'ai-components',
    content: {
      type: 'ai-form-assistant',
      content: `
        <div class="ai-form-assistant">
          <div class="assistant-header">
            <h3>AI Form Assistant</h3>
            <p>Let AI help you fill out this form</p>
          </div>
          <form>
            <div class="form-group">
              <label>Name</label>
              <input type="text" placeholder="Enter your name">
              <button type="button" class="ai-suggest">AI Suggest</button>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" placeholder="Enter your email">
              <button type="button" class="ai-suggest">AI Suggest</button>
            </div>
            <div class="form-group">
              <label>Message</label>
              <textarea placeholder="Enter your message"></textarea>
              <button type="button" class="ai-suggest">AI Suggest</button>
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      `,
      style: {
        '.ai-form-assistant': {
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: 'white',
          maxWidth: '500px'
        },
        '.assistant-header': {
          marginBottom: '20px',
          textAlign: 'center'
        },
        '.assistant-header h3': {
          margin: '0 0 5px 0',
          color: '#4285f4'
        },
        '.assistant-header p': {
          margin: '0',
          color: '#666'
        },
        '.form-group': {
          marginBottom: '15px',
          position: 'relative'
        },
        'label': {
          display: 'block',
          marginBottom: '5px',
          fontWeight: 'bold'
        },
        'input, textarea': {
          width: '100%',
          padding: '8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          boxSizing: 'border-box'
        },
        'textarea': {
          height: '100px',
          resize: 'vertical'
        },
        '.ai-suggest': {
          position: 'absolute',
          right: '5px',
          top: '30px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '12px',
          cursor: 'pointer'
        },
        'button[type="submit"]': {
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '10px 15px',
          cursor: 'pointer',
          width: '100%',
          marginTop: '10px'
        }
      }
    }
  });

  // Register AI component types
  editor.DomComponents.addType('ai-text-generator', {
    model: {
      defaults: {
        name: 'AI Text Generator',
        traits: [
          {
            type: 'select',
            name: 'mode',
            label: 'Mode',
            options: [
              { id: 'creative', name: 'Creative' },
              { id: 'professional', name: 'Professional' },
              { id: 'academic', name: 'Academic' }
            ]
          },
          {
            type: 'number',
            name: 'length',
            label: 'Length (words)',
            min: 10,
            max: 1000,
            default: 100
          }
        ]
      }
    }
  });

  editor.DomComponents.addType('ai-image-generator', {
    model: {
      defaults: {
        name: 'AI Image Generator',
        traits: [
          {
            type: 'text',
            name: 'prompt',
            label: 'Prompt'
          },
          {
            type: 'select',
            name: 'style',
            label: 'Style',
            options: [
              { id: 'realistic', name: 'Realistic' },
              { id: 'cartoon', name: 'Cartoon' },
              { id: 'abstract', name: 'Abstract' },
              { id: 'sketch', name: 'Sketch' }
            ]
          },
          {
            type: 'select',
            name: 'size',
            label: 'Size',
            options: [
              { id: 'small', name: '256x256' },
              { id: 'medium', name: '512x512' },
              { id: 'large', name: '1024x1024' }
            ]
          }
        ]
      }
    }
  });

  editor.DomComponents.addType('ai-chatbot', {
    model: {
      defaults: {
        name: 'AI Chatbot',
        traits: [
          {
            type: 'text',
            name: 'botName',
            label: 'Bot Name'
          },
          {
            type: 'text',
            name: 'welcomeMessage',
            label: 'Welcome Message'
          },
          {
            type: 'checkbox',
            name: 'enableVoice',
            label: 'Enable Voice'
          }
        ]
      }
    }
  });

  editor.DomComponents.addType('ai-form-assistant', {
    model: {
      defaults: {
        name: 'AI Form Assistant',
        traits: [
          {
            type: 'text',
            name: 'title',
            label: 'Title'
          },
          {
            type: 'text',
            name: 'description',
            label: 'Description'
          },
          {
            type: 'checkbox',
            name: 'autoSuggest',
            label: 'Auto Suggest'
          }
        ]
      }
    }
  });
};
