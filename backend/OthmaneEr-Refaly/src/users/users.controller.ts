
// this file was added for gamification

import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    create(@Body() body: { username: string; email: string }) {
        return this.usersService.createUser(body.username, body.email);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        // The + converts the string ID from the URL to a number
        return this.usersService.findOne(+id);
    }
}