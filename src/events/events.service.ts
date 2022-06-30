import { AttendeeAnswerEnum } from './attendee.entity';
import { Attendee } from 'src/events/attendee.entity';
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import e from "express";
import { Repository } from "typeorm";
import { Event } from "./event.entity";


@Injectable()
export class EventsService {

    private readonly logger = new Logger(EventsService.name)
    constructor(
        @InjectRepository(Event)
        private readonly eventsRepo: Repository<Event>
    ){}

    private getEventsBaseQuery() {
        return this.eventsRepo
        .createQueryBuilder('e')
        .orderBy('e.id', 'DESC');
    }

    public getEventsWithAttendeeCountQuery() {
        return this.getEventsBaseQuery()
        .loadRelationCountAndMap(
            'e.attendeeCount', 'e.attendees'
        )
        .loadRelationCountAndMap(
            'e.attendeeAccepted', 'e.attendees', 'attendee',
            (qb) => qb
                .where('attendee.answer = :answer',
                { answer: AttendeeAnswerEnum.Accepted })
        )
        .loadRelationCountAndMap(
            'e.attendeeMaybe', 'e.attendees', 'attendee',
            (qb) => qb
                .where('attendee.answer = :answer',
                { answer: AttendeeAnswerEnum.Maybe })
        )
        .loadRelationCountAndMap(
            'e.attendeeRejected', 'e.attendees', 'attendee',
            (qb) => qb
                .where('attendee.answer = :answer',
                { answer: AttendeeAnswerEnum.Rejected })
        );
    }

    public async getEvent(id: number): Promise<Event | undefined> {
        const query = this.getEventsWithAttendeeCountQuery()
        .andWhere("e.id = :id", { id });

        this.logger.debug(query.getSql());

        return await query.getOne();
    }

}