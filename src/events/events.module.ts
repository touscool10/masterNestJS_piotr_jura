import { Attendee } from './attendee.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './events.controller';
import { Event } from './event.entity';
import { EventsService } from './events.service';

@Module({
    imports: [ 
        TypeOrmModule.forFeature([Event, Attendee]),
    ],
    controllers: [ EventController ],
    providers: [ EventsService ]
})
export class EventsModule {}
