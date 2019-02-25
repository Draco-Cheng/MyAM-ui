interface ReturnObject<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

interface SimpleMessageResponse {
  message: string;
}