import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule,DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('MatchMacking-system')
    .setDescription('A systems that looks through the space and find matching pairs')
    .setVersion('1.0')
    .addTag('MatchMaking')
    .addTag('User')
    .addTag("Queue")
    
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);



  await app.listen(process.env.PORT ?? 3000);


}
bootstrap();
