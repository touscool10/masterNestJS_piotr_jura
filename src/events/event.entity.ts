import { Attendee } from './attendee.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from 'src/auth/user.entity';

@Entity()

export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    when: Date;

    @Column()
    address: string;

    @OneToMany(() => Attendee, (attendee) => attendee.event, {
        //eager: true,
        cascade: true,
        //cascade: ["insert","update"]
    })
    attendees: Attendee[];

    @ManyToOne(() => User, (user) => user.organized)
    @JoinColumn({ name: 'organizerId'})
    organizer:User;

    @Column({ nullable: true })
    organizerId: number;

    attendeeCount?: number;
    attendeeRejected?: number;
    attendeeMaybe?: number;
    attendeeAccepted?: number;

}