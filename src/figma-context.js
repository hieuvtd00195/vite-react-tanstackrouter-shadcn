import { getContext } from 'figma-context-mcp';

// Đọc token và fileKey từ biến môi trường (bảo mật hơn)
const FIGMA_TOKEN = import.meta.env.VITE_FIGMA_TOKEN || 'figd_DpUMzINWJxCKaNcjb4i5kIVFtyic_JYSypv3mzcd';
const FIGMA_FILE_KEY = 'onWeqW25Y4wAX8h8Qv4pCb'; // File key từ URL Figma bạn cung cấp

export async function fetchFigmaContext() {
  try {
    const context = await getContext({
      token: FIGMA_TOKEN,
      fileKey: FIGMA_FILE_KEY,
      nodeId,
      // Có thể thêm options nếu cần
    });
    return context;
  } catch (error) {
    console.error('Lỗi lấy context từ Figma:', error);
    return null;
  }
}

// Ví dụ dùng hàm này trong React hoặc script Node.js:
fetchFigmaContext('4113-42237').then(ctx => console.log(ctx));

