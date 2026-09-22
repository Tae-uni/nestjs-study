# Providers

A provider is any class Nest can create and hand to something else. Services are the kind you write most, but repositories, factories and helpers are providers too.

The split of responsibility:

- **Controller** — HTTP in and out. Parse the request, return a value.
- **Service** — business logic. Knows nothing about HTTP.

A controller never builds its own service. It declares what it needs and Nest supplies it.

## Express vs Nest

Express — wire it up myself:

```ts
// user.service.ts
export class UserService {
  findUser(id: string) { /* business logic */ }
}

// user.controller.ts
const userService = new UserService();

export const getUser = (req, res) => {
  res.json(userService.findUser(req.params.id));
};
```

Nest — declare the need, Nest wires it:

```ts
@Injectable()
export class UserService {
  findUser(id: string) { /* business logic */ }
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.findUser(id);
  }
}
```

## Dependency Injection

DI means whatever a class needs is handed to it from the outside instead of being created inside. The class stops deciding *which* instance it gets, so that decision moves to one place.

How Nest resolves it: **the constructor parameter type is the lookup key.**
`userService: UserService` tells Nest to find the provider registered as
`UserService` and pass it in. The type survives to runtime because
`reflect-metadata` and `emitDecoratorMetadata` keep it around, this is also why DTOs and providers must be classes, not interfaces.

```ts
constructor(private readonly userService: UserService) {}
```

That one line is TypeScript's **parameter property** shorthand. It declares the field, marks it `private readonly`, and assigns it — all at once. Without it you would write the field, the parameter, and the assignment separately.

## @Injectable and registration

Two things are required, and forgetting either fails differently:

1. `@Injectable()` on the class — marks it as managed by the DI container.
2. The class listed in a module's `providers` array.

```ts
@Module({
  controllers: [UserController],
  providers: [UserService, LoggerService],
})
export class UserModule {}
```

## Providers depend on providers

Injection is not only controller to service. A provider can take its own
dependencies and Nest resolves the whole chain.

```ts
@Injectable()
export class LoggerService {
  log(message: string) {
    console.log('[LOG]', message);
  }
}

@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  findOneUser(id: number) {
    this.logger.log(`Finding user ${id}`);
    ...
  }
}
```

```
UserController -> needs UserService
UserService    -> needs LoggerService
Nest           -> creates and connects everything
```

Nest builds the graph bottom up: LoggerService first, then UserService with the logger passed in, then UserController.

## Trade-offs

Worth it:
- Reusable and flexible — small single-purpose classes recombine easily.
- Testable — swap in a fake dependency instead of the real one, no patching.
- Maintainable — responsibilities stay separated.

The cost:
- More classes, more indirection.
- Harder to trace. Nothing in the code says *where* the instance came from; you have to look at the module to find out.
- More setup before anything runs.
