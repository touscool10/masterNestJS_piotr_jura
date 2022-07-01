import { Repository } from 'typeorm';
import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./input/create.user.dto";
import { User } from "./user.entity";
import { InjectRepository } from '@nestjs/typeorm';

@Controller('users')
export class UsersController{
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,

        private readonly authService: AuthService,
    ){}


    @Post()
    async create(@Body() createUserDto: CreateUserDto){
        const user = new User();

        if (createUserDto.password !== createUserDto.retypedPassword) {
            throw new BadRequestException(['Passwords are not identical']);
        }

        const existingUser = await this.usersRepo.findOne({ 
            where:  [
                { username: createUserDto.username }, 
                { email: createUserDto.email }
            ] 
        });

        if (existingUser) {
            throw new BadRequestException(['username or email is already taken!']);
        }

        user.email = createUserDto.email;
        user.username = createUserDto.username;
        user.password = await this.authService.hashPassword(createUserDto.password);
        user.firstName = createUserDto.firstName;
        user.lastName = createUserDto.lastName;

        return {
            ...(await this.usersRepo.save(user)),
            token: this.authService.getTokenForUser(user)
        }
    }
}