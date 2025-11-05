import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): {
    author: string;
    message: string;
    version: string;
    timestamp: string;
  } {
    return {
      author: 'John Muhoza && Waka Florian',
      message: 'Saintdeals System API!',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
