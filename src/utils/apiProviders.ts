import { ApiProvider, AuthType } from './apiConnectService';
import { Bot, Cloud, MessageSquare, Image, FileText, Mail, CreditCard, Database, Globe, Code, Briefcase, BarChart, FileSpreadsheet, Calendar, Phone, Video, Music, ShoppingCart, Users, Zap } from 'lucide-react';

// API Categories
export const API_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'ai', name: 'AI & ML', icon: Bot },
  { id: 'productivity', name: 'Productivity', icon: Calendar },
  { id: 'communication', name: 'Communication', icon: Mail },
  { id: 'crm', name: 'CRM & Sales', icon: Users },
  { id: 'marketing', name: 'Marketing', icon: BarChart },
  { id: 'payment', name: 'Payment', icon: CreditCard },
  { id: 'data', name: 'Data & Analytics', icon: Database },
  { id: 'developer', name: 'Developer Tools', icon: Code },
  { id: 'storage', name: 'Storage & Files', icon: FileText },
  { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart },
  { id: 'social', name: 'Social Media', icon: Globe },
  { id: 'media', name: 'Media & Content', icon: Video },
  { id: 'other', name: 'Other', icon: Zap },
];

// API Providers
export const API_PROVIDERS: ApiProvider[] = [
  // AI & ML Providers
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Connect to GPT-4, DALL-E, and other OpenAI services',
    longDescription: 'OpenAI offers powerful AI models for text generation, image creation, and more. Use GPT-4 for advanced language understanding, DALL-E for image generation, and other models for specialized tasks.',
    category: 'ai',
    icon: '/icons/openai.png',
    status: 'available',
    isPopular: true,
    authType: AuthType.API_KEY,
    authConfig: {
      type: AuthType.API_KEY,
      fields: [
        {
          key: 'apiKey',
          label: 'API Key',
          type: 'password',
          required: true,
          placeholder: 'sk-...',
          description: 'Your OpenAI API key'
        }
      ],
      testUrl: 'https://api.openai.com/v1/models',
      instructions: 'You can find your API key in the OpenAI dashboard under API keys.'
    },
    docsUrl: 'https://platform.openai.com/docs/introduction',
    websiteUrl: 'https://openai.com/'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Connect to Claude and other Anthropic AI models',
    longDescription: 'Anthropic provides Claude, a family of AI assistants that are helpful, harmless, and honest. Claude excels at thoughtful dialogue and complex reasoning.',
    category: 'ai',
    icon: '/icons/anthropic.png',
    status: 'available',
    isPopular: true,
    authType: AuthType.API_KEY,
    authConfig: {
      type: AuthType.API_KEY,
      fields: [
        {
          key: 'apiKey',
          label: 'API Key',
          type: 'password',
          required: true,
          placeholder: 'sk-ant-...',
          description: 'Your Anthropic API key'
        }
      ],
      testUrl: 'https://api.anthropic.com/v1/messages',
      instructions: 'You can find your API key in the Anthropic Console under API Keys.'
    },
    docsUrl: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api',
    websiteUrl: 'https://www.anthropic.com/'
  },
  {
    id: 'google-ai',
    name: 'Google AI',
    description: 'Connect to Gemini and other Google AI services',
    longDescription: 'Google AI provides access to Gemini models, PaLM, and other Google AI technologies. Use these models for text generation, chat, and multimodal AI capabilities.',
    category: 'ai',
    icon: '/icons/google-ai.png',
    status: 'available',
    isPopular: true,
    authType: AuthType.API_KEY,
    authConfig: {
      type: AuthType.API_KEY,
      fields: [
        {
          key: 'apiKey',
          label: 'API Key',
          type: 'password',
          required: true,
          placeholder: 'AIzaSy...',
          description: 'Your Google AI API key'
        }
      ],
      testUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
      instructions: 'You can get your API key from Google AI Studio or Google Cloud Console.'
    },
    docsUrl: 'https://ai.google.dev/docs',
    websiteUrl: 'https://ai.google.dev/'
  },
  {
    id: 'stability-ai',
    name: 'Stability AI',
    description: 'Connect to Stable Diffusion and other image generation models',
    longDescription: 'Stability AI is the company behind Stable Diffusion, a state-of-the-art text-to-image model. Use their API to generate high-quality images from text descriptions.',
    category: 'ai',
    icon: '/icons/stability.png',
    status: 'available',
    isPopular: false,
    authType: AuthType.API_KEY,
    authConfig: {
      type: AuthType.API_KEY,
      fields: [
        {
          key: 'apiKey',
          label: 'API Key',
          type: 'password',
          required: true,
          placeholder: 'sk-...',
          description: 'Your Stability AI API key'
        }
      ],
      testUrl: 'https://api.stability.ai/v1/engines/list',
      instructions: 'You can find your API key in the Stability AI dashboard.'
    },
    docsUrl: 'https://platform.stability.ai/docs/api-reference',
    websiteUrl: 'https://stability.ai/'
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Access thousands of open-source ML models',
    longDescription: 'Hugging Face is home to thousands of pre-trained models to perform tasks on different modalities such as text, vision, and audio. Connect to use models like BERT, T5, and many more.',
    category: 'ai',
    icon: '/icons/huggingface.png',
    status: 'available',
    isPopular: false,
    authType: AuthType.API_KEY,
    authConfig: {
      type: AuthType.API_KEY,
      fields: [
        {
          key: 'apiKey',
          label: 'API Key',
          type: 'password',
          required: true,
          placeholder: 'hf_...',
          description: 'Your Hugging Face API key'
        }
      ],
      testUrl: 'https://huggingface.co/api/models',
      instructions: 'You can find your API key in your Hugging Face account settings.'
    },
    docsUrl: 'https://huggingface.co/docs/api-inference/index',
    websiteUrl: 'https://huggingface.co/'
  },
  
  // Productivity Providers
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Read and write data to Google Sheets',
    longDescription: 'Connect to Google Sheets to read, write, and manipulate spreadsheet data. Automate data entry, reporting, and analysis with the Google Sheets API.',
    category: 'productivity',
    icon: '/icons/google-sheets.png',
    status: 'available',
    isPopular: true,
    authType: AuthType.OAUTH,
    authConfig: {
      type: AuthType.OAUTH,
      oauthConfig: {
        authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        redirectUri: 'http://localhost:3000/api/oauth/callback'
      },
      testUrl: 'https://sheets.googleapis.com/v4/spreadsheets',
      instructions: 'Click Connect to authorize access to your Google Sheets.'
    },
    docsUrl: 'https://developers.google.com/sheets/api',
    websiteUrl: 'https://www.google.com/sheets/about/'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Connect to Notion workspaces and databases',
    longDescription: 'Notion is an all-in-one workspace for notes, tasks, wikis, and databases. Connect to read and write data to your Notion workspace.',
    category: 'productivity',
    icon: '/icons/notion.png',
    status: 'available',
    isPopular: true,
    authType: AuthType.OAUTH,
    authConfig: {
      type: AuthType.OAUTH,
      oauthConfig: {
        authorizationUrl: 'https://api.notion.com/v1/oauth/authorize',
        tokenUrl: 'https://api.notion.com/v1/oauth/token',
        clientId: process.env.NEXT_PUBLIC_NOTION_CLIENT_ID || '',
        scopes: [],
        redirectUri: 'http://localhost:3000/api/oauth/callback'
      },
      testUrl: 'https://api.notion.com/v1/users/me',
      instructions: 'Click Connect to authorize access to your Notion workspace.'
    },
    docsUrl: 'https://developers.notion.com/',
    websiteUrl: 'https://www.notion.so/'
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Connect to Airtable bases and tables',
    longDescription: 'Airtable is a spreadsheet-database hybrid with the features of a database but applied to a spreadsheet. Connect to read and write data to your Airtable bases.',
    category: 'productivity',
    icon: '/icons/airtable.png',
    status: 'available',
    isPopular: false,
    authType: AuthType.API_KEY,
    authConfig: {
      type: AuthType.API_KEY,
      fields: [
        {
          key: 'apiKey',
          label: 'Personal Access Token',
          type: 'password',
          required: true,
          placeholder: 'pat...',
          description: 'Your Airtable Personal Access Token'
        }
      ],
      testUrl: 'https://api.airtable.com/v0/meta/bases',
      instructions: 'You can create a Personal Access Token in your Airtable account settings.'
    },
    docsUrl: 'https://airtable.com/developers/web/api/introduction',
    websiteUrl: 'https://airtable.com/'
  },
  
  // Communication Providers
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages and interact with Slack workspaces',
    longDescription: 'Connect to Slack to send messages, create channels, and interact with users in your workspace. Automate notifications and workflows with the Slack API.',
    category: 'communication',
    icon: '/icons/slack.png',
    status: 'available',
    isPopular: true,
    authType: AuthType.OAUTH,
    authConfig: {
      type: AuthType.OAUTH,
      oauthConfig: {
        authorizationUrl: 'https://slack.com/oauth/v2/authorize',
        tokenUrl: 'https://slack.com/api/oauth.v2.access',
        clientId: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || '',
        scopes: ['chat:write', 'channels:read', 'channels:join'],
        redirectUri: 'http://localhost:3000/api/oauth/callback'
      },
      testUrl: 'https://slack.com/api/auth.test',
      instructions: 'Click Connect to authorize access to your Slack workspace.'
    },
    docsUrl: 'https://api.slack.com/',
    websiteUrl: 'https://slack.com/'
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Send messages and interact with Discord servers',
    longDescription: 'Connect to Discord to send messages, create channels, and interact with users in your servers. Build bots and automate workflows with the Discord API.',
    category: 'communication',
    icon: '/icons/discord.png',
    status: 'available',
    isPopular: true,
    authType: AuthType.OAUTH,
    authConfig: {
      type: AuthType.OAUTH,
      oauthConfig: {
        authorizationUrl: 'https://discord.com/api/oauth2/authorize',
        tokenUrl: 'https://discord.com/api/oauth2/token',
        clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '',
        scopes: ['bot', 'applications.commands'],
        redirectUri: 'http://localhost:3000/api/oauth/callback'
      },
      testUrl: 'https://discord.com/api/users/@me',
      instructions: 'Click Connect to authorize access to your Discord server.'
    },
    docsUrl: 'https://discord.com/developers/docs/intro',
    websiteUrl: 'https://discord.com/'
  },
  
  // CRM & Sales Providers
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Connect to Salesforce CRM data and automation',
    longDescription: 'Salesforce is a leading CRM platform. Connect to access and manipulate your customer data, sales pipelines, and marketing campaigns.',
    category: 'crm',
    icon: '/icons/salesforce.png',
    status: 'available',
    isPopular: true,
    authType: AuthType.OAUTH,
    authConfig: {
      type: AuthType.OAUTH,
      oauthConfig: {
        authorizationUrl: 'https://login.salesforce.com/services/oauth2/authorize',
        tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
        clientId: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID || '',
        scopes: ['api', 'refresh_token'],
        redirectUri: 'http://localhost:3000/api/oauth/callback'
      },
      testUrl: 'https://login.salesforce.com/services/oauth2/userinfo',
      instructions: 'Click Connect to authorize access to your Salesforce organization.'
    },
    docsUrl: 'https://developer.salesforce.com/docs',
    websiteUrl: 'https://www.salesforce.com/'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Connect to HubSpot CRM, marketing, and sales tools',
    longDescription: 'HubSpot offers marketing, sales, service, and CMS software. Connect to access and manipulate your contacts, deals, tickets, and marketing campaigns.',
    category: 'crm',
    icon: '/icons/hubspot.png',
    status: 'available',
    isPopular: true,
    authType: AuthType.OAUTH,
    authConfig: {
      type: AuthType.OAUTH,
      oauthConfig: {
        authorizationUrl: 'https://app.hubspot.com/oauth/authorize',
        tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
        clientId: process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID || '',
        scopes: ['contacts', 'content'],
        redirectUri: 'http://localhost:3000/api/oauth/callback'
      },
      testUrl: 'https://api.hubapi.com/oauth/v1/access-tokens/current',
      instructions: 'Click Connect to authorize access to your HubSpot account.'
    },
    docsUrl: 'https://developers.hubspot.com/',
    websiteUrl: 'https://www.hubspot.com/'
  },
  
  // Payment Providers
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments and manage subscriptions',
    longDescription: 'Stripe is a suite of payment APIs that powers commerce for businesses of all sizes. Connect to process payments, manage subscriptions, and handle financial data.',
    category: 'payment',
    icon: '/icons/stripe.png',
    status: 'available',
    isPopular: true,
    authType: AuthType.API_KEY,
    authConfig: {
      type: AuthType.API_KEY,
      fields: [
        {
          key: 'apiKey',
          label: 'Secret Key',
          type: 'password',
          required: true,
          placeholder: 'sk_...',
          description: 'Your Stripe Secret Key'
        }
      ],
      testUrl: 'https://api.stripe.com/v1/customers',
      instructions: 'You can find your API keys in the Stripe Dashboard under Developers > API keys.'
    },
    docsUrl: 'https://stripe.com/docs/api',
    websiteUrl: 'https://stripe.com/'
  },
  
  // Developer Tools
  {
    id: 'github',
    name: 'GitHub',
    description: 'Manage repositories, issues, and pull requests',
    longDescription: 'GitHub is a platform for version control and collaboration. Connect to manage repositories, issues, pull requests, and more programmatically.',
    category: 'developer',
    icon: '/icons/github.png',
    status: 'available',
    isPopular: true,
    authType: AuthType.OAUTH,
    authConfig: {
      type: AuthType.OAUTH,
      oauthConfig: {
        authorizationUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
        scopes: ['repo', 'user'],
        redirectUri: 'http://localhost:3000/api/oauth/callback'
      },
      testUrl: 'https://api.github.com/user',
      instructions: 'Click Connect to authorize access to your GitHub account.'
    },
    docsUrl: 'https://docs.github.com/en/rest',
    websiteUrl: 'https://github.com/'
  },
  
  // Storage & Files
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Access and manage files in Dropbox',
    longDescription: 'Dropbox is a file hosting service that offers cloud storage, file synchronization, and client software. Connect to access, upload, and manage files in your Dropbox account.',
    category: 'storage',
    icon: '/icons/dropbox.png',
    status: 'available',
    isPopular: false,
    authType: AuthType.OAUTH,
    authConfig: {
      type: AuthType.OAUTH,
      oauthConfig: {
        authorizationUrl: 'https://www.dropbox.com/oauth2/authorize',
        tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
        clientId: process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID || '',
        scopes: [],
        redirectUri: 'http://localhost:3000/api/oauth/callback'
      },
      testUrl: 'https://api.dropboxapi.com/2/users/get_current_account',
      instructions: 'Click Connect to authorize access to your Dropbox account.'
    },
    docsUrl: 'https://www.dropbox.com/developers/documentation',
    websiteUrl: 'https://www.dropbox.com/'
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Access and manage files in Google Drive',
    longDescription: 'Google Drive is a file storage and synchronization service. Connect to access, upload, and manage files in your Google Drive account.',
    category: 'storage',
    icon: '/icons/google-drive.png',
    status: 'available',
    isPopular: true,
    authType: AuthType.OAUTH,
    authConfig: {
      type: AuthType.OAUTH,
      oauthConfig: {
        authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        scopes: ['https://www.googleapis.com/auth/drive'],
        redirectUri: 'http://localhost:3000/api/oauth/callback'
      },
      testUrl: 'https://www.googleapis.com/drive/v3/files',
      instructions: 'Click Connect to authorize access to your Google Drive.'
    },
    docsUrl: 'https://developers.google.com/drive/api/v3/about-sdk',
    websiteUrl: 'https://www.google.com/drive/'
  },
  
  // Social Media
  {
    id: 'twitter',
    name: 'Twitter',
    description: 'Post tweets and interact with Twitter',
    longDescription: 'Twitter is a social media platform where users post and interact with messages. Connect to post tweets, read timelines, and interact with users programmatically.',
    category: 'social',
    icon: '/icons/twitter.png',
    status: 'available',
    isPopular: true,
    authType: AuthType.OAUTH,
    authConfig: {
      type: AuthType.OAUTH,
      oauthConfig: {
        authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '',
        scopes: ['tweet.read', 'tweet.write', 'users.read'],
        redirectUri: 'http://localhost:3000/api/oauth/callback'
      },
      testUrl: 'https://api.twitter.com/2/users/me',
      instructions: 'Click Connect to authorize access to your Twitter account.'
    },
    docsUrl: 'https://developer.twitter.com/en/docs/twitter-api',
    websiteUrl: 'https://twitter.com/'
  },
  
  // E-commerce
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Manage products, orders, and customers in Shopify',
    longDescription: 'Shopify is an e-commerce platform for online stores and retail point-of-sale systems. Connect to manage products, orders, customers, and more in your Shopify store.',
    category: 'ecommerce',
    icon: '/icons/shopify.png',
    status: 'available',
    isPopular: true,
    authType: AuthType.OAUTH,
    authConfig: {
      type: AuthType.OAUTH,
      oauthConfig: {
        authorizationUrl: 'https://accounts.shopify.com/oauth/authorize',
        tokenUrl: 'https://accounts.shopify.com/oauth/token',
        clientId: process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID || '',
        scopes: ['read_products', 'write_products'],
        redirectUri: 'http://localhost:3000/api/oauth/callback'
      },
      testUrl: 'https://{shop}.myshopify.com/admin/api/2023-01/shop.json',
      instructions: 'Click Connect to authorize access to your Shopify store.'
    },
    docsUrl: 'https://shopify.dev/docs/api',
    websiteUrl: 'https://www.shopify.com/'
  },
];

// Helper function to get providers by category
export function getProvidersByCategory(category: string): ApiProvider[] {
  if (category === 'all') {
    return API_PROVIDERS;
  }
  return API_PROVIDERS.filter(provider => provider.category === category);
}

// Helper function to get a provider by ID
export function getProviderById(id: string): ApiProvider | undefined {
  return API_PROVIDERS.find(provider => provider.id === id);
}

// Helper function to get popular providers
export function getPopularProviders(limit: number = 6): ApiProvider[] {
  return API_PROVIDERS
    .filter(provider => provider.isPopular)
    .slice(0, limit);
}

// Helper function to search providers
export function searchProviders(query: string): ApiProvider[] {
  const lowerQuery = query.toLowerCase();
  return API_PROVIDERS.filter(
    provider => 
      provider.name.toLowerCase().includes(lowerQuery) || 
      provider.description.toLowerCase().includes(lowerQuery)
  );
}

export default {
  API_CATEGORIES,
  API_PROVIDERS,
  getProvidersByCategory,
  getProviderById,
  getPopularProviders,
  searchProviders
};
