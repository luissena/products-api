export interface EntriesResponse {
  total: number;
  skip: number;
  limit: number;
  items: ProductItem[];
}

export type ProductItem = {
  sys: ProductItemSys;
  fields: ProductItemFields;
};

export interface ProductItemSys {
  id: string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductItemFields {
  sku: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  color: string;
  price: number;
  currency: string;
  stock: number;
}

export interface ContentfulSyncResponse {
  sys: {
    type: string; // "Array"
  };
  items: ContentfulEntry[];
  nextPageUrl?: string;
  nextSyncUrl?: string;
}

export interface ContentfulEntry {
  metadata: {
    tags: any[];
    concepts: any[];
  };
  sys: {
    space: {
      sys: {
        type: 'Link';
        linkType: 'Space';
        id: string;
      };
    };
    id: string;
    type: 'Entry';
    createdAt: string;
    updatedAt: string;
    environment: {
      sys: {
        id: string;
        type: 'Link';
        linkType: 'Environment';
      };
    };
    publishedVersion: number;
    revision: number;
    contentType: {
      sys: {
        type: 'Link';
        linkType: 'ContentType';
        id: string; // "product"
      };
    };
  };
  fields: ProductFields;
}

export interface ProductFields {
  sku: {
    'en-US': string;
  };
  name: {
    'en-US': string;
  };
  brand: {
    'en-US': string;
  };
  model: {
    'en-US': string;
  };
  category: {
    'en-US': string;
  };
  color: {
    'en-US': string;
  };
  price: {
    'en-US': number;
  };
  currency: {
    'en-US': string;
  };
  stock: {
    'en-US': number;
  };
}
