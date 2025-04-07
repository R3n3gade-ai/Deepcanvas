import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useBrainStore from '../features/brain/store/brainStore';
import { BrainDocument, BrainCollection, BrainQuery } from '../features/brain/types';
import { AddKnowledgeDialog } from '../components/brain/AddKnowledgeDialog';
import { CollectionDialog } from '../components/brain/CollectionDialog';

export default function Brain() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'all' | 'collections'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [showAddKnowledgeDialog, setShowAddKnowledgeDialog] = useState(false);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [editingCollection, setEditingCollection] = useState<BrainCollection | undefined>(undefined);
  const [searchResults, setSearchResults] = useState<BrainDocument[]>([]);

  const {
    documents,
    collections,
    fetchDocuments,
    fetchCollections,
    searchDocuments,
    deleteDocument,
    deleteCollection,
    isLoading,
    error
  } = useBrainStore();

  // Fetch documents and collections on component mount
  useEffect(() => {
    fetchDocuments();
    fetchCollections();
  }, [fetchDocuments, fetchCollections]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query: BrainQuery = {
      query: searchQuery,
      filters: {
        contentTypes: selectedContentTypes.length > 0 ? selectedContentTypes : undefined,
        collections: selectedCollectionId ? [selectedCollectionId] : undefined,
      },
    };

    const results = await searchDocuments(query);

    // Convert search results to documents
    const resultDocuments = results.map(result => {
      const document = documents.find(doc => doc.id === result.documentId);
      if (document) return document;

      // If document not found in store, create a placeholder
      return {
        id: result.documentId,
        title: result.metadata.title,
        content: result.content,
        contentType: result.metadata.contentType as any,
        metadata: result.metadata,
        collectionIds: [],
      };
    }).filter(Boolean) as BrainDocument[];

    setSearchResults(resultDocuments);
  };

  // Filter documents based on selected collection and content types
  const filteredDocuments = selectedCollectionId
    ? documents.filter(doc => doc.collectionIds.includes(selectedCollectionId))
    : documents;

  const displayDocuments = searchQuery ? searchResults : filteredDocuments;

  // Handle collection edit
  const handleEditCollection = (collection: BrainCollection) => {
    setEditingCollection(collection);
    setShowCollectionDialog(true);
  };

  // Handle collection delete
  const handleDeleteCollection = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      await deleteCollection(id);
      if (selectedCollectionId === id) {
        setSelectedCollectionId(null);
      }
    }
  };

  // Handle document delete
  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(id);
    }
  };

  // Content type options
  const contentTypeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'pdf', label: 'PDF' },
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'url', label: 'URL' },
    { value: 'activity', label: 'Activity' },
  ];

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => setShowAddKnowledgeDialog(true)}
          >
            Add Knowledge
          </button>
          {activeTab === 'collections' && (
            <button
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => {
                setEditingCollection(undefined);
                setShowCollectionDialog(true);
              }}
            >
              New Collection
            </button>
          )}
        </div>
      </div>

      <div className="flex mb-6">
        <div className="w-64 pr-6">
          <div className="mb-4">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => {
                  setActiveTab('all');
                  setSelectedCollectionId(null);
                }}
              >
                All Knowledge
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'collections' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('collections')}
              >
                Collections
              </button>
            </div>
          </div>

          {activeTab === 'all' && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Filter by Type</h3>
              <div className="space-y-1">
                {contentTypeOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`type-${option.value}`}
                      checked={selectedContentTypes.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContentTypes([...selectedContentTypes, option.value]);
                        } else {
                          setSelectedContentTypes(selectedContentTypes.filter(type => type !== option.value));
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`type-${option.value}`} className="text-sm">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'collections' && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Collections</h3>
              <div className="space-y-1">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className={`flex items-center justify-between p-2 rounded-md ${selectedCollectionId === collection.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <button
                      className="flex items-center text-left flex-1"
                      onClick={() => setSelectedCollectionId(collection.id)}
                    >
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: collection.color || '#3b82f6' }}
                      />
                      <span className="text-sm">{collection.name}</span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({collection.documentIds.length})
                      </span>
                    </button>
                    <div className="flex space-x-1">
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => handleEditCollection(collection)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-600"
                        onClick={() => handleDeleteCollection(collection.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="mb-4">
            <div className="flex">
              <input
                type="text"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search your knowledge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-800">
              {error}
            </div>
          ) : displayDocuments.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? 'No results found for your search.'
                  : selectedCollectionId
                    ? 'This collection is empty.'
                    : 'Your knowledge base is empty.'}
              </p>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={() => setShowAddKnowledgeDialog(true)}
              >
                Add Your First Knowledge
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayDocuments.map((document) => (
                <div
                  key={document.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor:
                          document.contentType === 'text' ? '#3b82f6' :
                          document.contentType === 'pdf' ? '#ef4444' :
                          document.contentType === 'image' ? '#10b981' :
                          document.contentType === 'video' ? '#f59e0b' :
                          document.contentType === 'audio' ? '#8b5cf6' :
                          document.contentType === 'url' ? '#ec4899' :
                          '#6b7280'
                      }}
                    >
                      <span className="text-white text-xs">
                        {document.contentType.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <button
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => handleDeleteDocument(document.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                  <h3 className="font-medium mb-1 line-clamp-1">{document.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{document.content}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {document.metadata.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    Added {new Date(document.metadata.dateAdded).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Knowledge Dialog */}
      <AddKnowledgeDialog
        isOpen={showAddKnowledgeDialog}
        onClose={() => setShowAddKnowledgeDialog(false)}
        collections={collections}
      />

      {/* Collection Dialog */}
      <CollectionDialog
        isOpen={showCollectionDialog}
        onClose={() => setShowCollectionDialog(false)}
        collection={editingCollection}
      />
    </div>
  );
}