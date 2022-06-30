import { ListEvents } from './input/list.events';
import { UpdateEventDto } from './input/update-event.dto';
import { CreateEventDto } from './input/create-event.dto'; 
import { Event } from './event.entity'; 
import { Body, Controller, Delete, Get, HttpCode, Param, Put, Patch, Post, ParseIntPipe, ValidationPipe, Logger, NotFoundException, Query, UsePipes } from '@nestjs/common';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { throws } from 'assert';
import { Attendee } from './attendee.entity';
import { EventsService } from './events.service';

@Controller('events')
export class EventController {

    private readonly logger = new Logger(EventController.name);

    constructor( 
        @InjectRepository(Event)
        private readonly eventRepo: Repository<Event>,

        @InjectRepository(Attendee)
        private readonly attendeeRepo: Repository<Attendee>,

        private readonly eventsService: EventsService,

    ) {}

    private events: Event[] = [];


    @Get()
    @UsePipes(new ValidationPipe({ transform: true }))
    async findAll(@Query() filter: ListEvents) {

        //console.log("filter: ", filter);
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


    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const theEvent: Event = await this.eventsService.getEvent(id);
        if (theEvent === null || theEvent === undefined) {
            throw new NotFoundException();
        }
        return theEvent;
    }

    @Post()
    async create(@Body() input: CreateEventDto) {
        const event: any = {
            ...input,
            when: new Date(input.when),
        };
        const createdEvent =  this.eventRepo.create(event) ;
        console.log("createdEvent: ", createdEvent);

        const savedEvent = await this.eventRepo.save(createdEvent) ;
        console.log("savedEvent: ", savedEvent);

        return savedEvent ;
    }

    @Patch(':id')
    async update(@Param('id') id: number, @Body() input: UpdateEventDto) {

        let actualEvent = await this.eventRepo.findOneBy({ id: id }); 

        if (actualEvent === null) {
                throw new NotFoundException();
        }

        let newInput:Event = {
            ...actualEvent,
            ...input,
            when: input.when ? new Date(input.when) : actualEvent.when
        } ;

        //let updatedEvent = await this.eventRepo.update({ id }, newInput); 
        let updatedEvent = await this.eventRepo.save(newInput); 

        console.log("updatedEvent: ", updatedEvent)
        return updatedEvent ;
    }

    @Delete(':id')
    //@HttpCode(204)
    async delete(@Param('id') id) {
        const eventToRemove = await this.eventRepo.findOneBy({ id: id });
        
        if (eventToRemove === null) {
            throw new NotFoundException(); 
        }

        let deletedEvent = await this.eventRepo.remove(eventToRemove);  

        //let deletedEvent = await this.eventRepo.delete({ id });  
        return deletedEvent ;     
    }
}
