# Controllers

Controllers handle incoming `requests` and return `responses`.  
A controller is just a class with decorators.

A controller only works if it is listed in a module's `controllers` array.  
Forget that and every route 404s, with no error at startup.

```ts
@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

## Routing

The path is the class prefix + the method path.

```ts
@Controller('user')        // prefix
export class UserController {
  @Get()                   // GET /user
  @Get('all')              // GET /user/all
  @Get(':id')              // GET /user/:id   <- dynamic segment
}
```

**Always put static segments above dynamic ones.**
Routes are matched in declaration order, so `:id` declared first would swallow
`/user/all` and treat `"all"` as an id. No error, just the wrong handler.

```ts
@Get('all')     // OK - checked first
@Get(':id')     // catches everything else
```

Return value handling is automatic: return an object or array and Nest
serializes it to JSON. Default status is 200, except POST which is 201.

## Parameter Decorators

For `GET /products/42?sort=price&order=asc` with this body:

```json
{
  "name": "MacBook Pro",
  "price": 2499,
  "category": "Laptops"
}
```

| Decorator | Reads from | Example |
|---|---|---|
| `@Param('id')` | URL path segment | `42` |
| `@Query('sort')` | query string | `price` |
| `@Body()` | request body | the whole JSON object |
| `@Headers('authorization')` | request headers | |

Call them with no argument to get the whole object: `@Query()` gives
`{ sort: 'price', order: 'asc' }`.

```ts
@Get(':id')
getUserById(@Param('id') id: string) {
  return { id, name: 'John Doe' };
}

@Get()
getUsers(@Query('name') name: string) {
  // name is undefined when ?name= is not present
}
```

`@Param` and `@Query` always hand back **strings**. `/user/42` gives `'42'`,
not `42`. Convert explicitly, or use `ParseIntPipe` later.

`@Body` only carries data on methods that have a body — POST, PUT, PATCH.

## Data Transfer Objects (DTO)

A DTO is a TypeScript class defining the exact shape of incoming data.

Use a **class, not an interface**. Interfaces are erased at compile time, so
nothing survives at runtime. A class leaves a real value behind, which is what
`ValidationPipe` and `class-validator` need in order to check the payload.

```ts
// POST /user
{
  "name": "Adrian",
  "email": "ad@jsm.dev",
  "password": "jsmdev"
}
```

```ts
export class CreateUserDto {
  name: string;
  email: string;
  password: string;
}
```

```ts
@Post()
createUser(@Body() createUserDto: CreateUserDto) {
  return { data: createUserDto, message: 'User created successfully' };
}
```

Note: the DTO type alone does **not** validate anything. Right now it is just editor autocomplete.

### PartialType

An update DTO is usually the create DTO with every field optional. Instead of retyping it, derive it:

```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto.js';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

Requires `@nestjs/mapped-types`. It copies the fields and their validation
rules, marking them all optional.
