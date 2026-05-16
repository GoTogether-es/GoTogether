import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';

let cachedServer: any;

async function bootstrap() {
  console.log('Bootstrapping NestJS for Serverless...');
  if (!cachedServer) {
    try {
      const expressApp = express();

      // Ruta de diagnóstico directo en Express
      expressApp.get('/server/test-connection', (req, res) => {
        res.json({ message: 'Express is running correctly on Vercel', time: new Date().toISOString() });
      });

      const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), { 
 
        cors: true,
        logger: ['error', 'warn', 'log'] 
      });
      
      nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
      
      await nestApp.init();
      cachedServer = serverlessExpress({ app: expressApp });
      console.log('NestJS initialized successfully');
    } catch (err) {
      console.error('Error during NestJS bootstrap:', err);
      throw err;
    }
  }
  return cachedServer;
}

export const handler = async (event: any, context: any, callback: any) => {
  console.log('API Request received:', event.path);
  const server = await bootstrap();
  return server(event, context, callback);
};
