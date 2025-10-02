import { Controller, Post, Body } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { QueueDto } from "./dto/queue.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Queue")

@Controller("queue")
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  @ApiOperation({ summary: "Add user to queue" })
  @ApiResponse({
    status: 201,  
    description: "The user has been successfully added to the queue.",
  })
  @ApiResponse({ status: 400, description: "Bad Request. User already in queue or does not exist." })
  @ApiResponse({ status: 403, description: "Forbidden. User is not idle." })
  async addToQueue(@Body() dto: QueueDto) {
    // delegate to service
    return this.queueService.addToQueue(dto.userId, dto.mode);
  }
}
