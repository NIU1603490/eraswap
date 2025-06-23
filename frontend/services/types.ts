// src/types.ts
export interface UserData {
  _id: string;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  country: string;
  city: string;
  university: string;
  profilePicture: string;
  savedProducts: string[]; // obbjectId de productos guardados
  rating: {
    average: number;
    count: number;
  };
}

export interface User {
  _id: string;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  country: { _id: string; name: string };
  city: { _id: string; name: string };
  university: { _id: string; name: string };
  profilePicture: string;
  rating: {
    average: number;
    count: number;
  }
  savedProducts: string[]; // ObjectId de productos guardados
}

export interface Message {
  _id: string;
  conversation: string;
  sender: { _id: string; username: string; profilePicture: string };
  receiver: { _id: string; username: string; profilePicture: string };
  content: string;
  isRead: boolean;
  product?: { _id: string; title: string; images: string[] };
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  _id: string;
  participants: User[],//  { _id: string; username: string; profilePicture: string };
  product?: { _id: string; title: string; images: string[] };
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  _id: string,
  author: User,
  content: string,
  image: string, //only one image for now
  likes: [string],
  comments: [{
    user: User,
    content: string,
  }],
  createdAt: Date,
  updatedAt: Date,
}

export interface Country {
  _id: string;
  name: string;
}

export interface City {
  _id: string;
  name: string;
  country: {name: string};
}

export interface University {
  _id: string;
  name: string;
  city: {name: string};
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  country: string;
  city: string;
  university: string;
}

export interface FormData{
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  city: string;
  university: string;
  agreeTerms: boolean;
}

export interface SignInFields {
  email: string;
  password: string;
}

export interface ProductData {
  title: string,
  description: string,
  category: string,
  condition: string,
  price: number,
  seller: string,
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: { amount: number; currency: string };
  category: string;
  images: string[];
  seller: string;
  location: {
    city: {_id: string; name: string;},
    country: {_id: string; name: string;}
  },
  condition: string;
  status: string;
  saves: number;
}

export interface TransactionData {
  buyer: string;
  product: string;
  seller: string;
  price: { amount: number; currency: string };
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Canceled';
  paymentMethod: 'cash' | 'online';
  deliveryMethod: 'inPerson' | 'delivery';
  meetingDate: Date;
  meetingTime: string;
  meetingLocation: string;
  messageToSeller: string;
}

export interface Transaction {
  _id: string;
  buyer: {_id: string, username: string};
  product: {_id: string, title: string, images: string[]};
  seller: {_id: string, username: string};
  price: { amount: number; currency: string };
  status: 'Pending' | 'Confirmed'| 'Completed' | 'Canceled';
  paymentMethod: 'cash' | 'online';
  deliveryMethod: 'inPerson' | 'delivery';
  meetingDate: Date;
  meetingTime: string;
  meetingLocation: string;
  messageToSeller: string;
  createdAt: Date;
  updatedAt: Date;
}

  // Base interface for all API responses
  export interface BaseApiResponse {
    success: boolean;
    message?: string;
  }
  
  // Specific response types for different API calls
  export interface CountriesResponse extends BaseApiResponse {
    countries: Country[];
  }
  
  export interface CitiesResponse extends BaseApiResponse {
    cities: City[];
  }

  export interface UniversitiesResponse extends BaseApiResponse {
      universities: University[];
    }
  
  // Generic response type for other API calls (e.g., registerUser)
  export interface ApiResponse<T> extends BaseApiResponse {
    data?: T;
  }