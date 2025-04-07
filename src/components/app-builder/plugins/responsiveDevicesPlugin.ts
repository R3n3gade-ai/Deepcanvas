/**
 * GrapesJS plugin for responsive device management
 */
export const responsiveDevicesPlugin = (editor: any) => {
  // Add commands for device switching
  editor.Commands.add('set-device-desktop', {
    run: (editor: any) => editor.setDevice('Desktop')
  });
  
  editor.Commands.add('set-device-tablet', {
    run: (editor: any) => editor.setDevice('Tablet')
  });
  
  editor.Commands.add('set-device-mobile', {
    run: (editor: any) => editor.setDevice('Mobile')
  });

  // Add responsive utility classes
  const styleManager = editor.StyleManager;
  
  // Add display options
  styleManager.addProperty('responsive', {
    name: 'Responsive Visibility',
    property: 'display',
    type: 'radio',
    defaults: 'block',
    list: [
      { value: 'block', name: 'Show' },
      { value: 'none', name: 'Hide' }
    ]
  });

  // Add responsive classes category
  styleManager.addSector('responsive-classes', {
    name: 'Responsive',
    open: false,
    properties: [
      {
        name: 'Display in Desktop',
        property: 'display-desktop',
        type: 'select',
        defaults: '',
        list: [
          { value: '', name: 'Default' },
          { value: 'd-none d-lg-block', name: 'Hide on Desktop' },
          { value: 'd-lg-none', name: 'Show only on Desktop' }
        ]
      },
      {
        name: 'Display in Tablet',
        property: 'display-tablet',
        type: 'select',
        defaults: '',
        list: [
          { value: '', name: 'Default' },
          { value: 'd-none d-md-block d-lg-none', name: 'Hide on Tablet' },
          { value: 'd-md-none d-lg-block', name: 'Show only on Tablet' }
        ]
      },
      {
        name: 'Display in Mobile',
        property: 'display-mobile',
        type: 'select',
        defaults: '',
        list: [
          { value: '', name: 'Default' },
          { value: 'd-none d-sm-block', name: 'Hide on Mobile' },
          { value: 'd-sm-none', name: 'Show only on Mobile' }
        ]
      },
      {
        name: 'Flex Direction',
        property: 'flex-direction',
        type: 'radio',
        defaults: 'row',
        list: [
          { value: 'row', name: 'Row' },
          { value: 'column', name: 'Column' }
        ]
      },
      {
        name: 'Flex Direction (Mobile)',
        property: 'flex-direction-sm',
        type: 'select',
        defaults: '',
        list: [
          { value: '', name: 'Default' },
          { value: 'flex-sm-row', name: 'Row' },
          { value: 'flex-sm-column', name: 'Column' }
        ]
      }
    ]
  });

  // Add responsive utilities block category
  editor.BlockManager.addCategory({ id: 'responsive-utils', label: 'Responsive Utilities' });

  // Add responsive container block
  editor.BlockManager.add('responsive-container', {
    label: 'Responsive Container',
    category: 'responsive-utils',
    content: `
      <div class="container">
        <div class="row">
          <div class="col-md-12">
            <h3>Responsive Container</h3>
            <p>This container adjusts its width based on screen size.</p>
          </div>
        </div>
      </div>
    `,
    attributes: { class: 'fa fa-desktop' }
  });

  // Add responsive row block
  editor.BlockManager.add('responsive-row', {
    label: 'Responsive Row',
    category: 'responsive-utils',
    content: `
      <div class="row">
        <div class="col-sm-6 col-md-4 col-lg-3">
          <div class="p-3 border bg-light">Column 1</div>
        </div>
        <div class="col-sm-6 col-md-4 col-lg-3">
          <div class="p-3 border bg-light">Column 2</div>
        </div>
        <div class="col-sm-6 col-md-4 col-lg-3">
          <div class="p-3 border bg-light">Column 3</div>
        </div>
        <div class="col-sm-6 col-md-12 col-lg-3">
          <div class="p-3 border bg-light">Column 4</div>
        </div>
      </div>
    `,
    attributes: { class: 'fa fa-columns' }
  });

  // Add device-specific visibility blocks
  editor.BlockManager.add('desktop-only', {
    label: 'Desktop Only',
    category: 'responsive-utils',
    content: `
      <div class="d-none d-lg-block">
        <div class="p-3 border bg-light">
          <h4>Desktop Only Content</h4>
          <p>This content will only be visible on desktop devices.</p>
        </div>
      </div>
    `,
    attributes: { class: 'fa fa-desktop' }
  });

  editor.BlockManager.add('tablet-only', {
    label: 'Tablet Only',
    category: 'responsive-utils',
    content: `
      <div class="d-none d-md-block d-lg-none">
        <div class="p-3 border bg-light">
          <h4>Tablet Only Content</h4>
          <p>This content will only be visible on tablet devices.</p>
        </div>
      </div>
    `,
    attributes: { class: 'fa fa-tablet' }
  });

  editor.BlockManager.add('mobile-only', {
    label: 'Mobile Only',
    category: 'responsive-utils',
    content: `
      <div class="d-block d-md-none">
        <div class="p-3 border bg-light">
          <h4>Mobile Only Content</h4>
          <p>This content will only be visible on mobile devices.</p>
        </div>
      </div>
    `,
    attributes: { class: 'fa fa-mobile' }
  });

  // Add responsive order blocks
  editor.BlockManager.add('responsive-order', {
    label: 'Responsive Order',
    category: 'responsive-utils',
    content: `
      <div class="row">
        <div class="col-md-4 order-3 order-md-1">
          <div class="p-3 border bg-light">First on desktop, third on mobile</div>
        </div>
        <div class="col-md-4 order-1 order-md-2">
          <div class="p-3 border bg-light">Second on desktop, first on mobile</div>
        </div>
        <div class="col-md-4 order-2 order-md-3">
          <div class="p-3 border bg-light">Third on desktop, second on mobile</div>
        </div>
      </div>
    `,
    attributes: { class: 'fa fa-sort' }
  });
};
