import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';
import { AppModule } from '../apps/api/src/modules/app/app.module';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
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
  }
  return cachedServer;
}

export const handler = async (event: any, context: any, callback: any) => {
  // Manejo de errores global para el handler
  try {
    const server = await bootstrap();
    return await server(event, context, callback);
  } catch (err: any) {
    console.error('CRITICAL SERVERLESS ERROR:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
