import { UpdateEventDto } from './update-event.dto';
import { CreateEventDto } from './create-event.dto'; 
import { Event } from './event.entity'; 
import { Body, Controller, Delete, Get, HttpCode, Param, Put, Patch, Post, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('events')
export class EventController {

    constructor( 
        @InjectRepository(Event)
        private readonly eventRepo: Repository<Event>,

    ) {}

    private events: Event[] = [];

    @Get()
    async findAll(): Promise<Event[]> {
       return await this.eventRepo.find();
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

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        console.log(typeof id)
        const theEvent: Event = await this.eventRepo.findOneBy({ id: id }); 
        if (theEvent === null) {
            return {
                id: 0,
                name: "",
                description: "",
                when: "0000-00-00T00:00:00.Z000",
                address: ""
            };
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
            return "Event is not Found";
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
            return "Event not Found" ;  
        }

        let deletedEvent = await this.eventRepo.remove(eventToRemove);  

        //let deletedEvent = await this.eventRepo.delete({ id });  
        return deletedEvent ;     
    }
}
