NestJS Decorators Explained
What is a Decorator?

A decorator is simply a function that wraps another class or method to add behavior or metadata to it.

Under the hood, a decorator looks something like this:

function Injectable() {
  return function (target: Function) {
    // "target" is the class being decorated
    // NestJS stores metadata about it here
    Reflect.defineMetadata('injectable', true, target);
  };
}

You've actually been using decorators already — for example @Module().

The @ symbol simply means:

"Call this function and pass my class into it."

@Injectable()

This decorator tells NestJS that a class can be created and injected automatically wherever it is needed.

@Injectable()
export class UsersService {
  private users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    return this.users.find(user => user.id === id);
  }
}

Without @Injectable(), NestJS has no idea that this class exists or that it should manage it.

When @Injectable() is present:

NestJS registers the class

Stores it in its dependency injection container

Makes it available to other classes

NestJS Container (Dependency Injection)

Think of the NestJS container like a warehouse.

NestJS Container (Warehouse) 🏭

├── UsersService     ✅ registered (has @Injectable)
├── PostsService     ✅ registered (has @Injectable)
└── RandomClass      ❌ not registered (no @Injectable)

Only registered services can be injected into other classes.

@Controller()

This decorator marks a class as a request handler.

It tells NestJS that this class will handle incoming HTTP requests.

@Controller('users') // base path = /users
export class UsersController {
  constructor(private usersService: UsersService) {}
}

The string 'users' defines the base route.

All routes inside this controller will start with:

/users

Example:

/users
/users/1
/users/2
Route Decorators

Inside a controller, you define HTTP routes using method decorators.

Common Route Decorators
Decorator	HTTP Method
@Get()	GET
@Post()	POST
@Put()	PUT
@Delete()	DELETE

Example:

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get() // GET /users
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id') // GET /users/1
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id); // convert string → number
  }

  @Post() // POST /users
  create(@Body() createUserDto: any) {
    return { message: 'User created', data: createUserDto };
  }

  @Delete(':id') // DELETE /users/1
  remove(@Param('id') id: string) {
    return { message: `User ${id} deleted` };
  }
}
Route Construction

The final URL is always:

Base Path + Method Path

Examples:

@Controller('users') + @Get(':id')      →  GET /users/:id
@Controller('users') + @Post()          →  POST /users
@Controller('users') + @Delete(':id')   →  DELETE /users/:id
How NestJS Reads Everything

When your application starts, NestJS scans all decorators and builds the application automatically.

1. NestFactory.create(AppModule)
        ↓
2. NestJS reads @Module() metadata
        ↓
3. Finds:
      controllers: [UsersController]
      providers:   [UsersService]
        ↓
4. Reads @Injectable() on UsersService
      → registers it in the container
        ↓
5. Reads @Controller('users')
      → registers base route /users
        ↓
6. Reads @Get(), @Post(), etc
      → maps HTTP routes to methods
        ↓
7. App is ready 🚀
Full Working Example
users.service.ts
@Injectable()
export class UsersService {
  private users = [{ id: 1, name: 'Alice' }];

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    return this.users.find(u => u.id === id);
  }
}
users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll(); // GET /users
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id); // GET /users/1
  }
}
users.module.ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
What Happens When a Request Arrives?

Example request:

GET /users/1

Flow:

Request
   ↓
UsersController.findOne()
   ↓
UsersService.findOne(1)
   ↓
User returned
   ↓
NestJS automatically sends JSON response
Key Takeaway

Decorators are metadata labels that tell NestJS how your application works.

Decorator	Purpose
@Injectable()	"NestJS can manage this service"
@Controller()	"This class handles HTTP requests"
@Get() / @Post()	"This method handles this route"

NestJS reads these labels when the app starts and automatically wires everything together.