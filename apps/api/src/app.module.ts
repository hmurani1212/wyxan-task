import { Controller, Get, Module } from '@nestjs/common';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { PeopleModule } from './people/people.module';
import { SitesModule } from './sites/sites.module';
import { VisitsModule } from './visits/visits.module';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  health() {
    return {
      ok: this.connection.readyState === 1,
      db: this.connection.readyState === 1 ? 'connected' : 'disconnected',
      at: new Date().toISOString(),
    };
  }
}

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/smallweb',
      { serverSelectionTimeoutMS: 5000 },
    ),
    PeopleModule,
    SitesModule,
    VisitsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
