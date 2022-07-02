import { ListEvents, WhenEventFilter } from './input/list.events';
import { AttendeeAnswerEnum } from './attendee.entity';
import { Attendee } from 'src/events/attendee.entity';
import { ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import e from "express";
import { DeleteResult, Repository } from "typeorm";
import { Event } from "./event.entity";
import { paginate, PaginationOptions } from './pagination/paginator';
import { CreateEventDto } from './input/create-event.dto';
import { User } from 'src/auth/user.entity';
import { UpdateEventDto } from './input/update-event.dto';


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

    private async getEventsWithAttendeeCountFiltered(filter?: ListEvents) {
        let query = this.getEventsWithAttendeeCountQuery();

        if(!filter || filter.when == 1 ){
            return query;
        }

        if(filter.when){

            if (filter.when == WhenEventFilter.Today) {
                query = query
                .andWhere(`e.when >= CURDATE() AND e.when <= CURDATE() + INTERVAL 1 DAY`);
            }
            if (filter.when == WhenEventFilter.Tomorrow) {
                query = query
                .andWhere(`e.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE() + INTERVAL 2 DAY`);
            }
            if (filter.when == WhenEventFilter.ThisWeek) {
                query = query
                .andWhere(`YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)`);
            }
            if (filter.when == WhenEventFilter.NextWeek) {
                    query = query
                    .andWhere(`YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1) + 1`);
            }
            
            return query;
        }
    }

    public async getEventsWithAttendeeCountFilteredPaginated(
        filter: ListEvents,
        paginateOptions: PaginationOptions
    ) {
        return await paginate(
        await this.getEventsWithAttendeeCountFiltered(filter), 
        paginateOptions
        );
    }

    public async getEvent(id: number): Promise<Event | undefined> {
        const query = this.getEventsWithAttendeeCountQuery()
        .andWhere("e.id = :id", { id });

        this.logger.debug(query.getSql());

        return await query.getOne();
    }

    public async createEvent(input: CreateEventDto, user: User): Promise<Event> {
        const event: any = {
            ...input,
            when: new Date(input.when),
            organizer: user,
            //organizerId: user.id
        };

        return await this.eventsRepo.save(event) ;         
    }

    public async updateEvent(event: Event, input: UpdateEventDto): Promise<Event> {

        let newInput:Event = {
            ...event,
            ...input,
            when: input.when ? new Date(input.when) : event.when
        } ;

        let updatedEvent = await this.eventsRepo.save(newInput); 

        console.log("updatedEvent: ", updatedEvent)
        return updatedEvent ;
    }

    public async deleteEvent(id: number):  Promise<DeleteResult> {

        return await this.eventsRepo
        .createQueryBuilder('e')
        .delete()
        .where('id = :id', { id })
        .execute();
    }

}