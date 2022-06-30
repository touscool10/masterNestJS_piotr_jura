import { SchoolModule } from './school/school.module';
import { AppDummy } from './app.dummy';
import { AppJapanService } from './app.japan.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';
import ormConfig from './config/orm.config';
import ormConfigProd from './config/orm.config.prod';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig],
      expandVariables: true
    }),
    TypeOrmModule.forRootAsync({
      useFactory: process.env.NODE_ENV !== 'production' 
      ? ormConfig : ormConfigProd
    }),
  EventsModule,
  SchoolModule
],
  controllers: [AppController],
  providers: [
    {
      provide: AppService,
      useClass: AppJapanService
      //useClass: AppService
    },
    {
      provide: "APP_NAME",
      useValue: "Setonde"
    },
    {
      provide: "MESSAGE",
      useFactory: (app) => { return `${app.dummy()} Factory!`; },
      inject: [AppDummy]
    }, 
    AppDummy 
  ],
})
export class AppModule {}
