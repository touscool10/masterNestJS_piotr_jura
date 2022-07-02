import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ListEvents } from './input/list.events';
import { UpdateEventDto } from './input/update-event.dto';
import { CreateEventDto } from './input/create-event.dto'; 
import { Event } from './event.entity'; 
import { Body, Controller, Delete, Get, HttpCode, Param, Put, Patch, Post, ParseIntPipe, ValidationPipe, Logger, NotFoundException, Query, UsePipes, UseGuards } from '@nestjs/common';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { throws } from 'assert';
import { Attendee } from './attendee.entity';
import { EventsService } from './events.service';
import { User } from 'src/auth/user.entity';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { AuthGuardJwt } from 'src/auth/auth-guard.jwt';
import console from 'console';

@Controller('events')
export class EventController {

    private readonly logger = new Logger(EventController.name);

    constructor(
        /*@InjectRepository(Attendee)
        private readonly attendeeRepo: Repository<Attendee>,*/

        private readonly eventsService: EventsService,

    ) {}

    private events: Event[] = [];


    @Get()
    @UsePipes(new ValidationPipe({ transform: true }))
    async findAll(@Query() filter: ListEvents) {

        //this.logger.log(`Hit the findAll route`);
        
        const events = await this.eventsService.getEventsWithAttendeeCountFilteredPaginated(
            filter, {
                limit: 2,
                currentPage: filter.page,
                total: true
            });

        //this.logger.debug(`Found ${events.length} events`);
        
        return events;
    }

/*
    @Get('/practice')
    async practice() {
        return await this.eventRepo.find({
            select: ['id','when'],
            where: [{ 
                id: MoreThan(3),
                when: MoreThan( new Date('2021-02-12T13:00:00') )
                }, {
                    description: Like('%meet%')
                }],
            order: {
                id: 'DESC'
            },
            take: 2,
        });
    }

    @Get('/practice_2')
    async practice_2() {
        return await this.eventRepo.findOne({
            where: { id: 2},
            relations: ['attendees']
        });
    }

    @Get('/practice_3')
    async practice_3() {
        return await this.attendeeRepo.findOne({
            where: { id: 1},
            //loadEagerRelations: false
            relations: ['event']
        });
    }

    @Get('/practice_4')
    async practice_4() {
        const event  = await this.eventRepo.findOne({
            where: { id: 1}
        });

        let attendee = new Attendee();
        attendee.name = 'Setonde';
        attendee.event = event;

        await this.attendeeRepo.save(attendee) ;

        return event;
    }


    @Get('/practice_5')
    async practice_5() {
        let event  =  new Event() ;

        event.id = 1 ;

        let attendee = new Attendee();
        attendee.name = 'Crespin';

        attendee.event = event;

        await this.attendeeRepo.save(attendee) ;

        return event;
    }

    @Get('/cascade')
    async cascade() {
        let event  =  await this.eventRepo.findOne({
            where: {id: 1},
            relations: ['attendees']
        }) ;

        let attendee = new Attendee();
        attendee.name = 'Using Cascade 5';

        event.attendees.push(attendee);

        await this.eventRepo.save(event) ;

        return event;
    }
*/


    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const theEvent: Event = await this.eventsService.getEvent(id);
        if (theEvent === null || theEvent === undefined) {
            throw new NotFoundException();
        }
        return theEvent;
    }

    @Post()
    @UseGuards(AuthGuardJwt)
    async create(
        @Body() input: CreateEventDto,
        @CurrentUser() user: User | null, 
        ) 
    {
        return await this.eventsService.createEvent(input, user);
    }

    @Patch(':id')
    @UseGuards(AuthGuardJwt)
    async update(
        @Param('id') id: number, 
        @Body() input: UpdateEventDto,
        @CurrentUser() user: User) {

        let actualEvent = await this.eventsService.getEvent(id);

        if (actualEvent === null) {
                throw new NotFoundException();
        }

        if (actualEvent.organizerId !==  user.id)  {
            throw new ForbiddenException(
                null, `You are not authorized to change this event!`);
        }

        let updatedEvent = await this.eventsService.updateEvent(actualEvent, input);

        console.log("updatedEvent: ", updatedEvent)
        return updatedEvent ;
    }

    @Delete(':id')
    @UseGuards(AuthGuardJwt)
    //@HttpCode(204)
    async delete(
        @Param('id') id,
        @CurrentUser() user: User) {

        let event = await this.eventsService.getEvent(id) ;

        if (!event) {
            throw new NotFoundException();
        }

        if (event.organizerId !==  user.id) {
            throw new ForbiddenException(null, `You are not authorized to delete this event!`);
        }

        const result =  await this.eventsService.deleteEvent(id);

        if (result?.affected !== 1) {
            throw new NotFoundException(); 
        } else {
           return "Deleted with success!"            
        }
    }
}
