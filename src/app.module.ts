import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventController } from './events/event.controller';
import { Event } from './events/event.entity';
import { EventsModule } from './events/events.module';

@Module({
  imports: [TypeOrmModule.forRoot({
    type:'mysql',
    host:'127.0.0.1',
    port:8006,
    username: 'root',
    password: 'example',
    database: 'nest-events',
    entities: [Event],
    synchronize: true
  }),
  EventsModule
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
