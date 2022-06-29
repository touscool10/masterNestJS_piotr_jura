import { IsDateString, IsString, Length } from "class-validator";


export class CreateEventDto{

    @IsString({ message: "The name must be a string" })
    @Length(5, 255, { message: "The name length is wrong: min 5 characters and max 255 characters." })
    name: string;

    @Length(5, 255)
    description: string;

    @IsDateString()
    when: string;

    @Length(5, 255)
    address: string;
}