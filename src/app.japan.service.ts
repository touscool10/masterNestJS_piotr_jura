import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class AppJapanService{

    constructor(
        @Inject("APP_NAME")
        private readonly person: any,

        @Inject("MESSAGE")
        private readonly message: any,
    ) {}

    getHello(): string {
        console.log(process.env.DB_HOST);
        return `ハロー・ワールド! from ${ this.person }; ${this.message}`;
    }

}
