# DeepCanvas Brain Feature

The Brain feature in DeepCanvas allows users to save and organize knowledge from across the application. This knowledge is then used to enhance AI responses and provide a more personalized experience.

## Features

- **Knowledge Base**: Store and organize various types of content (text, PDFs, images, videos, URLs, etc.)
- **Collections**: Organize content into collections for better management
- **Semantic Search**: Find relevant content using natural language queries
- **Activity Tracking**: Track user activity across the platform for context-aware AI
- **AI Integration**: Enhance AI responses with relevant knowledge from the Brain

## Components

### 1. Brain Page

The Brain page is the main interface for managing your knowledge base. Here you can:

- View and manage your knowledge collections
- Add different types of content to your knowledge base
- Search and filter your knowledge
- View insights about your knowledge base

Access the Brain page from the sidebar navigation.

### 2. Save to Brain Button

The "Save to Brain" button allows you to save content from any page to your knowledge base. There are several ways to use this feature:

#### A. Global Brain Button

A floating button appears on every page, allowing you to capture the current page content with a single click.

#### B. Inline Save to Brain Button

Add a "Save to Brain" button to specific components or sections of your application:

```tsx
import { SaveToBrainButton } from "../components/brain";

// In your component:
<SaveToBrainButton 
  pageTitle="Your Title" 
  pageContent="Content to save" 
  pageUrl={window.location.href} 
  variant="outline" 
  size="sm" 
/>
```

#### C. Programmatic Capture

Capture content programmatically using the `useBrainCapture` hook:

```tsx
import { useBrainCapture } from "../utils/BrainCaptureProvider";

// In your component:
const { enableCapture } = useBrainCapture();

// Later, when you want to capture content:
enableCapture(
  "Title of the content", 
  "Content to save", 
  "Optional URL"
);
```

### 3. Brain Integration with AI

The Brain is automatically integrated with the Chat feature. When you ask a question, the AI will search your knowledge base for relevant information and use it to enhance its response.

## Implementation Details

### Adding the Brain Capture Button to a Page

1. Import the necessary components:

```tsx
import { SaveToBrainButton } from "../components/brain";
// or for programmatic capture:
import { useBrainCapture } from "../utils/BrainCaptureProvider";
```

2. Add the button to your component:

```tsx
<SaveToBrainButton 
  pageTitle="Dashboard Overview" 
  pageContent="Content to save" 
  variant="outline" 
/>
```

3. Or use programmatic capture:

```tsx
const { enableCapture } = useBrainCapture();

// Later, when you want to capture content:
const handleCapture = () => {
  const content = "Content to save";
  enableCapture("Title", content);
};

<button onClick={handleCapture}>Capture</button>
```

### Customizing the Brain Capture Button

The `SaveToBrainButton` component accepts the following props:

- `pageTitle`: The title of the content to save
- `pageContent`: The content to save
- `pageUrl`: The URL of the content (defaults to current URL)
- `variant`: Button variant (default, outline, ghost, link)
- `size`: Button size (default, sm, lg, icon)
- `className`: Additional CSS classes
- `onSaved`: Callback function to run after saving

### Customizing the Global Brain Button

The `GlobalBrainButton` component accepts the following props:

- `position`: Position on the screen (top-right, bottom-right, top-left, bottom-left)
- `offset`: Distance from the edge of the screen in pixels

## Best Practices

1. **Be Selective**: Only save important and relevant content to the Brain
2. **Organize Content**: Use collections to organize related content
3. **Add Context**: Include relevant context when saving content
4. **Use Tags**: Add tags to make content more discoverable
5. **Review Regularly**: Periodically review and clean up your knowledge base
