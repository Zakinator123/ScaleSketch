import type { DocumentSource } from '../types';

/**
 * Process an image file and return a DocumentSource
 */
async function processImageFile(file: File): Promise<DocumentSource> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          type: 'image',
          name: file.name,
          data: img
        });
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${file.name}`));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Process a PDF file (future implementation)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function processPDFFile(_file: File): Promise<DocumentSource> {
  // TODO: Implement PDF processing
  throw new Error('PDF processing not yet implemented');
}

/**
 * Process a CAD file (future implementation)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function processCADFile(_file: File): Promise<DocumentSource> {
  // TODO: Implement CAD processing
  throw new Error('CAD processing not yet implemented');
}

/**
 * Detect file type and route to appropriate processor
 */
export async function processFile(file: File): Promise<DocumentSource> {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  // Check for image types
  if (mimeType.startsWith('image/')) {
    return processImageFile(file);
  }
  
  // Check for PDF
  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return processPDFFile(file);
  }
  
  // Check for CAD formats
  const cadExtensions = ['dwg', 'dxf', 'dwf'];
  if (cadExtensions.includes(extension)) {
    return processCADFile(file);
  }
  
  throw new Error(`Unsupported file type: ${file.name}`);
}

/**
 * Process clipboard content
 */
export async function processClipboardItem(item: ClipboardItem): Promise<DocumentSource | null> {
  // Check for image types in clipboard
  const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  
  for (const type of imageTypes) {
    if (item.types.includes(type)) {
      const blob = await item.getType(type);
      const file = new File([blob], 'pasted-image.png', { type });
      return processFile(file);
    }
  }
  
  return null;
}

