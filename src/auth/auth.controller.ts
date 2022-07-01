import { Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { request } from "http";
import { use } from "passport";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { User } from "./user.entity";


@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('login')
    @UseGuards(AuthGuard('local'))
    async login( @CurrentUser() user: User  ) {
        console.log(process.env.AUTH_SECRET)
        return {
            userId: user.id,
            token: this.authService.getTokenForUser(user),
        }
    }

    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@CurrentUser() user: User) {
        return user;
    }

}
