/**
 * Browser-side document text extractor supporting PDF, TXT, MD, RTF, JSON, CSV
 */

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // Plain text / Markdown / JSON / CSV
  if (
    fileType.includes('text') ||
    fileType.includes('json') ||
    fileType.includes('csv') ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.md') ||
    fileName.endsWith('.json') ||
    fileName.endsWith('.csv') ||
    fileName.endsWith('.rtf')
  ) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Gagal membaca file teks'));
      reader.readAsText(file);
    });
  }

  // PDF extraction
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Dynamic import to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source to CDN matching version if not set
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/build/pdf.worker.min.mjs`;
      }

      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      
      const textPieces: string[] = [];
      const numPages = Math.min(pdf.numPages, 20); // Limit to first 20 pages

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        textPieces.push(pageText);
      }

      const extracted = textPieces.join('\n\n').trim();
      if (extracted.length > 0) {
        return extracted;
      }
      throw new Error('PDF tidak mengandung teks yang dapat dibaca (kemungkinan berupa scan gambar).');
    } catch (err: any) {
      console.warn('[PDF Extractor] Error using pdfjs-dist, attempting fallback:', err);
      // Fallback: try reading as raw text for simple text-based PDFs
      try {
        const text = await file.text();
        const clean = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
        if (clean.length > 50) return clean;
      } catch {
        // ignore
      }
      throw new Error(err.message || 'Gagal membaca isi PDF.');
    }
  }

  // DOC / DOCX fallback text extraction
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    try {
      // DOCX is a zip archive containing word/document.xml
      const text = await file.text();
      const stripped = text.replace(/<[^>]+>/g, ' ').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
      if (stripped.length > 30) {
        return stripped;
      }
    } catch {
      // ignore
    }
    throw new Error('Format DOC/DOCX terenkripsi atau kompleks. Silakan simpan sebagai PDF atau TXT.');
  }

  throw new Error('Format file tidak didukung. Harap gunakan PDF atau TXT.');
}
