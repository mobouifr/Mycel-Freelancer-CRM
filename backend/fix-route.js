const fs = require('fs');
const content = fs.readFileSync('src/clients/clients.controller.ts', 'utf8');
const modified = content.replace(
  /\s*@Get\(':id'\)[\s\S]*?(?=\s*@Put\(':id'\))/g, 
  ''
).replace(
  /\s*@Put\(':id'\)/, 
  `\n\n  @Get(':id')\n  async findOne(@Request() req: any, @Param('id') id: string) {\n    return this.clientsService.findOne(req.user.id, id);\n  }\n\n  @Put(':id')`
);
// wait that moves findOne above Put, which it already is.
// Let's just do it cleanly using sed or awk
