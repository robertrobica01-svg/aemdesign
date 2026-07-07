export interface Product {
  id: string;
  title: string;
  category: 'tablou' | 'agenda' | 'sticker';
  price: number;
  imageUrl: string;
  description: string;
  isHidden: boolean;
  createdAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}
