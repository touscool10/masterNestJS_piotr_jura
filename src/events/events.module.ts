import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './event.controller';
import { Event } from './event.entity';

@Module({
    imports: [ 
        TypeOrmModule.forFeature([Event]),
    ],
    controllers: [ EventController ]
})
export class EventsModule {}
