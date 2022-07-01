import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Type } from "class-transformer";
import { LocalStrategy } from "./local.strategy";
import { User } from "./user.entity";
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersController } from './user.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            useFactory: () => ({ 
                secret:process.env.AUTH_SECRET,
                //secret: `${process.env.AUTH_SECRET}`,
                signOptions: {
                    expiresIn:'60m'
                }
            })
        })
    ],
    providers: [LocalStrategy, AuthService, JwtStrategy],
    controllers: [AuthController, UsersController],
})
export class AuthModule {}