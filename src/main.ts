import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common'
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor'
import { TransformInterceptor } from './shared/interceptors/transform.interceptor'
import envConfig from './shared/config'
import { join } from 'path'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    })

    // Global Pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        exceptionFactory: (validationErrors) => {
          const errors = validationErrors.map((error) => ({
            field: error.property,
            error: Object.values(error.constraints).join(', '),
            value: error.value,
          }))
          return new UnprocessableEntityException(errors)
        },
      }),
    )

    // Global Interceptors
    app.useGlobalInterceptors(new LoggingInterceptor())
    app.useGlobalInterceptors(new TransformInterceptor())

    // CORS
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    })

    // Static Files
    if (process.env.NODE_ENV !== 'production') {
      app.useStaticAssets(join(__dirname, '..', 'uploads', 'images'), {
        prefix: '/static/image',
      })
      app.useStaticAssets(join(__dirname, '..', 'uploads', 'videos'), {
        prefix: '/static/video-stream',
      })
    }

    // Logging
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Port:', process.env.PORT || envConfig.PORT)
    console.log('Server URL:', envConfig.SERVER_URL)

    // Start server
    const port = process.env.PORT || envConfig.PORT || 3000
    await app.listen(port)
    console.log(`Application is running on: ${await app.getUrl()}`)
  } catch (error) {
    console.error('Bootstrap error:', error)
    throw error
  }
}

bootstrap()
