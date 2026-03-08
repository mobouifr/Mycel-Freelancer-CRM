import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UsersService } from '../../users/users.service';
import { Injectable } from '@nestjs/common';


export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}