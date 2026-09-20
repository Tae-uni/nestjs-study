import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';

// @Post()  // POST /user
// @Put(':id')  // PUT /user/:id
// @Delete(':id')  // DELETE /user/:id


@Controller('user')
export class UserController {
  // @Get('all')  // GET /user/all
  // @Get(':id')  // GET /user/:id  -  dynamic segment
  @Get()
  getUsers(@Query('name') name: string) {
    const users = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Adrian' },
    ];

    if (name) {
      return users.filter((user) =>
        user.name.toLowerCase().includes(name.toLocaleLowerCase()),
      );
    }

    return users;
  }
  @Get(':id')
  getUserById(@Param('id') id: string) {
    return { id, name: 'John Doe' };
  }
  @Post()
  createUser(@Body() body: any) {
    return { message: 'User created successfully' };
  }
}
