import { JWTPayload } from 'jose';

export interface SessionPayload extends JWTPayload {
  userData: {
    userId: string;
  };
}
