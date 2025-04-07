// Mock brain service for local development
const brain = {
  // Mock function to search the brain
  search: async (query: string, options?: any) => {
    console.log('Searching brain for:', query, options);
    return {
      results: [
        {
          id: 'result-1',
          content: 'This is a mock search result for: ' + query,
          score: 0.95,
          metadata: { source: 'mock-data' }
        }
      ]
    };
  },
  
  // Mock function to add content to the brain
  addContent: async (content: string, metadata?: any) => {
    console.log('Adding content to brain:', content, metadata);
    return {
      id: 'content-' + Date.now(),
      success: true
    };
  },
  
  // Mock function to get brain content
  getContent: async (id: string) => {
    console.log('Getting brain content:', id);
    return {
      id,
      content: 'This is mock content for ID: ' + id,
      metadata: { source: 'mock-data' }
    };
  }
};

export default brain;
