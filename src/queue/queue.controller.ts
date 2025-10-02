import { Controller, Post, Body } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { QueueDto } from "./dto/queue.dto";
import { LeaveQueueDto } from "./dto/leave-queue.dto";
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
  @ApiResponse({
    status: 400,
    description: "Bad Request. User already in queue or does not exist.",
  })
  @ApiResponse({ status: 403, description: "Forbidden. User is not idle." })
  async addToQueue(@Body() dto: QueueDto) {
    return this.queueService.addToQueue(dto.userId, dto.mode);
  }

  @Post("leave")
  @ApiOperation({ summary: "Remove user from queue" })
  @ApiResponse({
    status: 200,
    description: "The user has been successfully removed from the queue.",
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request. User not in queue or does not exist.",
  })
  async leaveQueue(@Body() dto: LeaveQueueDto) {
    return this.queueService.leaveQueue(dto.userId);
  }
}
