import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common'
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor'
import { TransformInterceptor } from './shared/interceptors/transform.interceptor'
import envConfig from './shared/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, //tự động loại bỏ các field không được khai báo decorator trong DTO
    forbidNonWhitelisted: true, //tự động trả về lỗi nếu các field không được khai báo trong DTO mà client truyền lên
    transform: true, //tự động chuyển đổi dữ liệu sang kiểu mà chúng ta mong muốn
    transformOptions: {
      enableImplicitConversion: true //tự động chuyển đổi kiểu dữ liệu của các field
    },
    exceptionFactory: (validationErrors) => {
      const errors = validationErrors.map((error) => ({
        field: error.property,
        error: Object.values(error.constraints).join(', '),
        value: error.value
      }))
      return new UnprocessableEntityException(errors)
    }
  }))
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());
  console.log('Server is running on http://localhost:4000')
  await app.listen(envConfig.PORT ?? 4000)
}
bootstrap()
