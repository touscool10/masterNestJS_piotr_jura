import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppService { 

  constructor(
    @Inject("APP_NAME")
    private readonly person: any,
) {}

  getHello(): string {
    return `Hello World! from ${ this.person }`;
  }
}
