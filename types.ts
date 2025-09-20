export interface Product {
  id: string;
  name: string;
  price: number;
  images: {
    url: string;
    fileId: string;
  }[];
  mp_payment_link: string;
  stock: number;
  description?: string;
  categoryId?: string;
  slug?: string;
  // New fields for advanced filtering and sorting
  brand?: string;
  condition?: 'novo' | 'usado' | 'recondicionado' | 'semi-novo';
  rating?: {
    rate: number;
    count: number;
  };
  createdAt?: any; // To allow for Firestore Timestamps
}

export interface Category {
    id:string;
    name: string;
    slug: string;
    parentId?: string;
}

export interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
    actionType?: 'link' | 'whatsapp' | 'none';
    actionValue?: string;
}

export interface Testimonial {
    id: string;
    name: string;
    quote: string;
    image: {
        url: string;
        fileId: string;
    };
}

export interface SiteSettings {
    id: string; // Should be a singleton doc id, e.g., "homepage"
    logo?: {
        url: string;
        fileId: string;
    };
    hero: {
        title: string;
        description: string;
        images: {
            id: string;
            url: string;
            fileId: string;
        }[];
    };
    gallery: {
        id: string; // To be used as a key
        url: string;
        fileId: string;
    }[];
}

export interface Order {
    id: string;
    items: {
        id: string;
        name: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    status: 'pending' | 'paid' | 'failed';
    paymentId?: string;
    createdAt: any; // Firestore Timestamp
}