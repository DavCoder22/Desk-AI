import { Controller, Post, Get, Body } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Controller()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('feedback')
  registrarFeedback(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.registrarFeedback(dto);
  }

  @Get('dashboard/precision')
  getPrecision() {
    return this.feedbackService.getPrecision();
  }
}
