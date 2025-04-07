import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import './GrapesJSEditor.css';

interface GrapesJSEditorProps {
  projectId: string;
  initialContent?: string;
  initialCss?: string;
  onSave: (content: string, css: string) => void;
  onPublish?: () => void;
}

export function GrapesJSEditor({
  projectId,
  initialContent = '',
  initialCss = '',
  onSave,
  onPublish
}: GrapesJSEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize GrapesJS
  useEffect(() => {
    if (!editorRef.current) return;

    // Clean up any existing editor
    if (editor) {
      editor.destroy();
    }

    // Initialize GrapesJS editor
    const newEditor = grapesjs.init({
      container: editorRef.current,
      height: '100%',
      width: '100%',
      storageManager: {
        id: `gjs-${projectId}`,
        type: 'local',
        autosave: true,
        autoload: true,
        stepsBeforeSave: 1
      },
      deviceManager: {
        devices: [
          {
            name: 'Desktop',
            width: '',
          },
          {
            name: 'Tablet',
            width: '768px',
            widthMedia: '992px',
          },
          {
            name: 'Mobile',
            width: '320px',
            widthMedia: '480px',
          }
        ]
      },
      panels: {
        defaults: [
          {
            id: 'panel-basic-actions',
            el: '.panel__basic-actions',
            buttons: [
              {
                id: 'save',
                className: 'btn-save',
                label: 'Save',
                command: 'save-project',
              },
              {
                id: 'publish',
                className: 'btn-publish',
                label: 'Publish',
                command: 'publish-project',
              }
            ]
          }
        ]
      },
      blockManager: {
        appendTo: '#blocks',
        blocks: [
          {
            id: 'section',
            label: 'Section',
            attributes: { class: 'gjs-block-section' },
            content: `<section class="py-5">
              <div class="container">
                <h2 class="mb-4">This is a section title</h2>
                <p>This is a section paragraph with some text content.</p>
              </div>
            </section>`,
          },
          {
            id: 'text',
            label: 'Text',
            content: '<div data-gjs-type="text">Insert your text here</div>',
          },
          {
            id: 'heading',
            label: 'Heading',
            content: '<h2 class="mb-3">Heading Text</h2>',
          },
          {
            id: 'paragraph',
            label: 'Paragraph',
            content: '<p class="mb-3">This is a paragraph of text. You can edit this to add your own content.</p>',
          },
          {
            id: 'image',
            label: 'Image',
            content: { type: 'image' },
            activate: true,
          },
          {
            id: 'button',
            label: 'Button',
            content: '<button class="btn btn-primary">Click me</button>',
          },
          {
            id: 'divider',
            label: 'Divider',
            content: '<hr class="my-4">',
          },
          {
            id: 'container',
            label: 'Container',
            content: '<div class="container py-4"></div>',
          },
          {
            id: 'row',
            label: 'Row',
            content: '<div class="row"></div>',
          },
          {
            id: 'column',
            label: 'Column',
            content: '<div class="col-md-4"></div>',
          },
          {
            id: 'link',
            label: 'Link',
            content: '<a href="#">Link Text</a>',
          },
          {
            id: 'list',
            label: 'List',
            content: `<ul class="mb-3">
              <li>List Item 1</li>
              <li>List Item 2</li>
              <li>List Item 3</li>
            </ul>`,
          },
          {
            id: 'card',
            label: 'Card',
            content: `<div class="card mb-4">
              <img class="card-img-top" src="https://via.placeholder.com/300x150" alt="Card image cap">
              <div class="card-body">
                <h5 class="card-title">Card title</h5>
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="#" class="btn btn-primary">Go somewhere</a>
              </div>
            </div>`,
          },
          {
            id: 'hero',
            label: 'Hero',
            content: `<div class="jumbotron">
              <div class="container">
                <h1 class="display-4">Hello, world!</h1>
                <p class="lead">This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>
                <hr class="my-4">
                <p>It uses utility classes for typography and spacing to space content out within the larger container.</p>
                <a class="btn btn-primary btn-lg" href="#" role="button">Learn more</a>
              </div>
            </div>`,
          },
          {
            id: 'form',
            label: 'Form',
            content: `<form>
              <div class="form-group">
                <label for="exampleInputEmail1">Email address</label>
                <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email">
                <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
              </div>
              <div class="form-group">
                <label for="exampleInputPassword1">Password</label>
                <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password">
              </div>
              <div class="form-check">
                <input type="checkbox" class="form-check-input" id="exampleCheck1">
                <label class="form-check-label" for="exampleCheck1">Check me out</label>
              </div>
              <button type="submit" class="btn btn-primary">Submit</button>
            </form>`,
          },
          {
            id: 'ai-text',
            label: 'AI Text Generator',
            content: `<div class="p-3 bg-light border rounded mb-3">
              <h5 class="mb-2">AI Generated Text</h5>
              <p>This text will be generated by AI based on your prompt.</p>
              <div class="input-group mb-3">
                <input type="text" class="form-control" placeholder="Enter your prompt...">
                <div class="input-group-append">
                  <button class="btn btn-primary" type="button">Generate</button>
                </div>
              </div>
            </div>`,
          },
          {
            id: 'ai-image',
            label: 'AI Image Generator',
            content: `<div class="p-3 bg-light border rounded mb-3">
              <h5 class="mb-2">AI Generated Image</h5>
              <div class="text-center mb-3">
                <img src="https://via.placeholder.com/300x200?text=AI+Generated+Image" class="img-fluid rounded">
              </div>
              <div class="input-group mb-3">
                <input type="text" class="form-control" placeholder="Describe the image you want...">
                <div class="input-group-append">
                  <button class="btn btn-primary" type="button">Generate</button>
                </div>
              </div>
            </div>`,
          },
        ],
      },
      canvas: {
        styles: [
          'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
          'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        ],
        scripts: [
          'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
        ]
      }
    });

    // Set initial content if provided
    if (initialContent || initialCss) {
      newEditor.setComponents(initialContent);
      newEditor.setStyle(initialCss);
    }

    // Add custom commands
    newEditor.Commands.add('save-project', {
      run: (editor: any) => {
        const html = editor.getHtml();
        const css = editor.getCss();
        onSave(html, css);
      }
    });

    newEditor.Commands.add('publish-project', {
      run: () => {
        if (onPublish) {
          onPublish();
        }
      }
    });

    // Set up event listeners
    newEditor.on('load', () => {
      setIsLoading(false);
    });

    // Store editor instance
    setEditor(newEditor);

    // Clean up on unmount
    return () => {
      if (newEditor) {
        newEditor.destroy();
      }
    };
  }, [projectId, initialContent, initialCss, onSave, onPublish]);

  return (
    <div className="grapesjs-editor-container">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      <div className="editor-sidebar">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Components</h3>
          <p className="text-sm text-gray-500">Drag components to the canvas</p>
        </div>
        <div id="blocks" className="panel-content"></div>
      </div>
      <div className="editor-main">
        <div className="editor-toolbar">
          <div className="flex items-center">
            <button className="device-button active" title="Desktop">
              <i className="fas fa-desktop"></i>
            </button>
            <button className="device-button" title="Tablet">
              <i className="fas fa-tablet-alt"></i>
            </button>
            <button className="device-button" title="Mobile">
              <i className="fas fa-mobile-alt"></i>
            </button>
          </div>
          <div className="panel__basic-actions">
            <button className="action-button secondary" onClick={() => {
              if (editor) {
                editor.Commands.run('core:undo');
              }
            }}>
              <i className="fas fa-undo"></i> Undo
            </button>
            <button className="action-button secondary" onClick={() => {
              if (editor) {
                editor.Commands.run('core:redo');
              }
            }}>
              <i className="fas fa-redo"></i> Redo
            </button>
            <button className="action-button primary" onClick={() => {
              if (editor) {
                editor.Commands.run('save-project');
              }
            }}>
              <i className="fas fa-save"></i> Save
            </button>
            <button className="action-button success" onClick={() => {
              if (editor) {
                editor.Commands.run('publish-project');
              }
            }}>
              <i className="fas fa-globe"></i> Publish
            </button>
          </div>
        </div>
        <div ref={editorRef} className="editor-canvas"></div>
      </div>
    </div>
  );
}
